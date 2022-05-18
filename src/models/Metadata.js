import { model, Schema } from "mongoose";

const MetadataSchema = new Schema({
  menu: [
    {
      type: Object,
      required: true,
    },
  ],
});

const Metadata = model("Metadata", MetadataSchema);

export default Metadata;
