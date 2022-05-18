import * as yup from "yup";

const title = yup
  .string()
  .required("Title of Blog is required.")
  .min(5, "Title of the Blog should have atleast 5 characters.")
  .max(200, "Title of the Blog should have atmost 50 characters.");

const content = yup
  .string()
  .required("Content of the Blog is required.")
  .min(20, "Content of the Blog should have atleast 5 characters.");

const description = yup
  .string()
  .required("Description of the Post is required")
  .min(20, "Description if the post should have 30 characters ");

export const NewPostRules = yup.object().shape({
  title,
  content,
  description,
});
