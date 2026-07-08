import mongoose from "mongoose";

const QuoteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Teks quote wajib diisi"],
      maxlength: [1000, "Teks quote maksimal 1000 karakter"],
    },
    verseRef: {
      type: String,
      required: [true, "Referensi ayat wajib diisi"],
    },
    verseText: {
      type: String,
      required: [true, "Teks ayat Arab wajib diisi"],
    },
    verseTranslation: {
      type: String,
      required: [true, "Terjemahan ayat wajib diisi"],
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "ID penulis wajib ada"],
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Quote || mongoose.model("Quote", QuoteSchema);
