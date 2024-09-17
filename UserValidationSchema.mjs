export const UserValidationSchema = {
  email: {
    notEmpty: {
      errorMessage: "Email is required",
    },
    isEmail: {
      errorMessage: "Invalid email format",
    },
  },
  username: {
    notEmpty: {
      errorMessage: "Username is required",
    },
  },
  password: {
    isLength: {
      options: { min: 6 },
      errorMessage: "Password must be at least 6 characters long",
    },
    notEmpty: {
      errorMessage: "Password is required",
    },
  },
};
