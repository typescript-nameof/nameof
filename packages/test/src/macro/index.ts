// eslint-disable-next-line import/no-extraneous-dependencies
import nameof from "@typescript-nameof/babel-macro";

nameof<Console>((c) => c.log);
nameof<Console>((c) => c);