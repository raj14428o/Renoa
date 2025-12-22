const conversationSchema = new Schema(
  {
    roomId: {
      type: String,
      unique: true,
      index: true,
      required: true,
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: "user",
    }],
    lastMessageAt: Date,
  },
  { timestamps: true }
);
