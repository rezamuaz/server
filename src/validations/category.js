import * as yup from 'yup';

const name = yup
    .string()
    .min(3, 'category added should have atleast 3 characters')

export const NewCategoryRules = yup.object().shape({name});
