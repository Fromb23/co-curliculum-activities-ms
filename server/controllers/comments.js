import prisma from "../config/db.js";

export const createComment = async (req, res) => {
  try {
    const { activityId, userId, studentId, comment, parentId, senderType } = req.body;
    const trainer = await prisma.trainer.findUnique({
      where: { userId: userId },
      select: { id: true },
    });
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    const newComment = await prisma.comment.create({
      data: {
        activityId,
        studentId,
        trainerId: trainer.id,
        parentId,
        comment,
        senderType,
      },
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCommentsByStudentId = async (req, res) => {
  console.log("Fetching comments for user ID:", req.params.userId);
  try {
    const { userId } = req.params;
    const parsedUserId = parseInt(userId, 10);

    const student = await prisma.student.findUnique({
      where: { userId: parsedUserId },
    });

    if (!student) {
      console.log("No student found for user ID:", parsedUserId);
      return res.status(404).json({ message: "Student not found" });
    }

    const studentId = student.id;

    const comments = await prisma.comment.findMany({
      where: { studentId: studentId },
      include: {
        activity: true,
      },
    });

    if (comments.length === 0) {
      console.log("No comments found for student ID:", studentId);
      return res.status(404).json({ message: "No comments found" });
    }

    console.log("Fetched comments:", comments);
    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCommentsByActivityId = async (req, res) => {
  console.log("Fetching comments for activity ID:", req.params.activityId);
  try {
    const { activityId } = req.params;
    const parsedActivityId = parseInt(activityId, 10);

    const comments = await prisma.comment.findMany({
      where: { activityId: parsedActivityId },
      include: {
        activity: true,
      },
    });
    if (comments.length === 0) {
      console.log("No comments found for activity ID:", parsedActivityId);
      return res.status(404).json({ message: "No comments found" });
    }

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    // Check if the comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Delete the comment
    await prisma.comment.delete({
      where: { id: commentId },
    });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTrainerByTrainerId = async (req, res) => {
  try {
    const { trainerId } = req.params;
    const parsedTrainerId = parseInt(trainerId, 10);

    const trainer = await prisma.trainer.findUnique({
      where: { id: parsedTrainerId },
      include: {
        user: true,
      },
    });
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    const { fullName } = trainer.user;

    res.status(200).json({ fullName });
  } catch (error) {
    console.error("Error fetching trainer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCommentsByTrainerId = async (req, res) => {
  try {
    const { trainerId } = req.params;
    const userId = parseInt(trainerId, 10);

    const trainer = await prisma.trainer.findUnique({
      where: { userId: userId },
    });
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    const rawComments = await prisma.comment.findMany({
      where: { trainerId: trainer.id },
      include: {
        activity: true,
        trainer: true,
        student: {
          include: {
            user: true,
          },
        },
      },
    });
    
    if (rawComments.length === 0) {
      return res.status(404).json({ message: "No comments found" });
    }
const comments = rawComments.map(comment => ({
  ...comment,
  studentFullName: comment.student?.user?.fullName || "Unknown Student",
}));
res.status(200).json(comments);

  } catch (error) {
    console.error("Error fetching comments by trainer ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateReadMessage = async (req, res) => {
  try {
    const { commentId } = req.params;

    // Check if the comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }



    // Update the readMessage field
    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(commentId) },
      data: { read: true },
    });

    res.status(200).json(updatedComment);
  } catch (error) {
    console.error("Error updating read message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};