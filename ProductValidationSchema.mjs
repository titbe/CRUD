export const ProductValidationSchema = {
  name: {
    notEmpty: true,
    errorMessage: "Name is required",
  },
  price: {
    notEmpty: true,
    isFloat: {
      options: { gt: 0 },
      errorMessage: "Price must be an integer greater than 0",
    },
    errorMessage: "Price is required",
  },
  details: {
    optional: true,
  },
};
