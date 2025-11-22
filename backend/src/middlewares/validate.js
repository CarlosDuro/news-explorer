import { celebrate, Joi, Segments } from 'celebrate';

export const validateSignup = celebrate({
  [Segments.BODY]: Joi.object({
    name: Joi.string().min(2).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
});

export const validateSignin = celebrate({
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
});

export const validateArticle = celebrate({
  [Segments.BODY]: Joi.object({
    keyword: Joi.string().required(),
    title: Joi.string().required(),
    text: Joi.string().required(),
    date: Joi.string().required(),
    source: Joi.string().required(),
    link: Joi.string().uri().required(),
    image: Joi.string().uri().required(),
  }),
});
