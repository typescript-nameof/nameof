// eslint-disable-next-line import/no-extraneous-dependencies
import nameof from "ts-nameof.macro";

nameof<Console>((c) => c.log);
nameof<Console>((c) => c);
