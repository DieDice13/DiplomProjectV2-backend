import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Zа-яА-ЯёЁ\s'-]+$/)
    .required()
    .messages({
      "string.empty": "Имя не может быть пустым",
      "string.min": "Имя должно содержать минимум 2 символа",
      "string.max": "Имя должно содержать не более 50 символов",
      "string.pattern.base":
        "Имя может содержать только буквы, пробелы, апострофы и дефисы",
      "any.required": "Имя обязательно для заполнения",
    }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.empty": "Email не может быть пустым",
      "string.email": "Некорректный формат email",
      "any.required": "Email обязателен для заполнения",
    }),

  password: Joi.string()
    .min(6)
    .max(64)
    .pattern(/^[a-zA-Z0-9!@#$%^&*()_+=\-[\]{}|\\:;"'<>,.?/`~]+$/)
    .required()
    .messages({
      "string.empty": "Пароль не может быть пустым",
      "string.min": "Пароль должен содержать минимум 6 символов",
      "string.max": "Пароль не должен превышать 64 символа",
      "string.pattern.base": "Пароль содержит недопустимые символы",
      "any.required": "Пароль обязателен для заполнения",
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.empty": "Email не может быть пустым",
      "string.email": "Некорректный формат email",
      "any.required": "Email обязателен для заполнения",
    }),

  password: Joi.string().required().messages({
    "string.empty": "Пароль не может быть пустым",
    "any.required": "Пароль обязателен для заполнения",
  }),
});
