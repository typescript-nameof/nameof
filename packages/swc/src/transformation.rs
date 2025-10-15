use swc_core::{common::{Span, SyntaxContext}, ecma::ast::{Expr, Lit, Tpl, TplElement}};

use crate::{diagnostics::{NameofError, NameofResult}, serialization::{LitValue, SegmentFormat}, utils::unwrap_arg};

/// Provides the functionality to check whether the underlying segment is local.
pub trait CheckLocalSegment {
    /// Checks whether the current segment is a variable which was introduced in a `nameof` function expression.
    fn is_local(&self) -> bool;
}

/// Represents a node which has a name.
pub trait GetNodeContext<'a> {
    /// Gets the syntax context of the node.
    fn get_context(&self) -> Option<&'a SyntaxContext>;
}

/// Represents the segment of a name.
pub trait NameSegment<'a>: CheckLocalSegment {
    /// Gets the format of the segment.
    fn get_format(&self) -> NameofResult<'a, SegmentFormat<'a>>;

    /// Gets the span containing the current segment.
    fn get_span(&self) -> Span;

    /// Gets the name of the segment.
    fn get_name(&self) -> NameofResult<'a, String> {
        self.get_format()?.get_name()
    }

    /// Gets the next segment.
    fn get_next(&mut self) -> Option<Box<Self>>;

    /// Appends the name of this segment to the specified `literal`.
    fn append(&self, literal: &mut Tpl) -> NameofResult<'a, ()> {
        let format = self.get_format()?;

        if literal.quasis.len() == 0 {
            if let SegmentFormat::Ident(name) = format {
                literal.quasis.push(TplElement {
                    raw: name.into(),
                    ..Default::default()
                });

                return Ok(());
            } else {
                literal.quasis.push(Default::default())
            }
        }

        let current_quasi = literal.quasis.last_mut().unwrap();
        let mut current_text = current_quasi.raw.to_string();

        current_text.push_str(&match &format {
            SegmentFormat::ComputedProp(indexer) => format!(
                "[{}]",
                match indexer {
                    LitValue::Str(str) => format!("\"{str}\""),
                    LitValue::Num(num) => num.to_string(),
                }
            ),
            SegmentFormat::Ident(name) => format!(".{name}"),
            SegmentFormat::Interpolation(_) => "[".to_string(),
        });

        current_quasi.raw = current_text.into();

        if let SegmentFormat::Interpolation(call) = format {
            match call.args.first() {
                None => todo!("Warn about absence of args"),
                Some(arg) => {
                    let expr = unwrap_arg(arg)?;
                    literal.exprs.push(Box::new(expr.clone()));
                    literal.quasis.push(Default::default());
                }
            }
        }

        Ok(())
    }
}

/// Provides the functionality to collect segments in different formats.
pub trait SegmentCollector<'a> {
    /// Returns either the names of the segments as a vector or an error.
    fn split(self: Box<Self>) -> NameofResult<'a, Vec<String>>;
    /// Returns either the names of the segments as a dotted path or an error.
    fn full(self: Box<Self>) -> NameofResult<'a, Expr>;
}

/// Provides the functionality to walk over segments.
pub struct SegmentWalker<S> {
    /// The index of the first segment to include.
    pub start_index: Option<isize>,
    /// The current name segment.
    pub current: Option<S>,
}

impl<'a, S> SegmentWalker<S>
where
    S: NameSegment<'a>,
{
    /// Gets the segments to collect.
    fn get_segments(self: Box<Self>) -> NameofResult<'a, Vec<S>> {
        let segments: Vec<S> = match self.start_index {
            Some(index) => {
                if index < 0 {
                    self.take(-index as usize).collect()
                } else {
                    let items = self.collect::<Vec<_>>();
                    let len = items.len();
                    items.into_iter().take(len - (index as usize)).collect()
                }
            }
            _ => self.collect(),
        };

        if let [segment, ..] = &segments[..] {
            if segment.is_local() {
                return Err(NameofError::MissingAccessor(
                    segment.get_span(),
                    segment.get_name()?,
                ));
            }
        }

        Ok(segments)
    }
}

impl<'a, S> Iterator for SegmentWalker<S>
where
    S: NameSegment<'a>,
{
    type Item = S;

    fn next(&mut self) -> Option<Self::Item> {
        let mut result = self.current.take();

        if let Some(segment) = &mut result {
            self.current = segment.get_next().map(|s| *s);
        }

        result
    }
}

impl<'a, S> SegmentCollector<'a> for SegmentWalker<S>
where
    S: NameSegment<'a>,
{
    fn split(self: Box<Self>) -> NameofResult<'a, Vec<String>> {
        let mut names = Vec::new();

        for segment in self.get_segments()? {
            match segment.get_name() {
                Ok(name) => names.push(name),
                Err(err) => return Err(err),
            }
        }

        Ok(names.into_iter().rev().collect())
    }

    fn full(self: Box<Self>) -> NameofResult<'a, Expr> {
        let mut result = Tpl::default();

        for segment in self.get_segments()?.into_iter().rev() {
            segment.append(&mut result)?;
        }

        Ok(match result.exprs.len() {
            0 => Expr::Lit(Lit::from(result.quasis.last().unwrap().raw.to_string())),
            _ => Expr::Tpl(result),
        })
    }
}
