import prisma from '../config/db.js';

export const createNewReport = async (req, res) => {
  console.log('Creating new report:', req.body);
  try {
    const { studentId, title, trainerId, content, activityName, performanceRating, date, attachments } = req.body;

    if (!studentId || !activityName || !trainerId || !content) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    const activityRecord = await prisma.activity.findFirst({
      where: { name: activityName },
      select: { id: true },
    });

    if (!activityRecord) {
        return res.status(404).json({ message: 'Activity not found.' });
        }
    console.log('Activity ID found in reports:', activityRecord.id);

    const newReport = await prisma.report.create({
      data: {
        studentId,
        activityId: activityRecord.id,
        title,
        trainerId,
        content,
        performanceRating: performanceRating || null,
        date: new Date().toISOString(),
        attachments: attachments || null,
      },
      include: {
        student: true,
        activity: true,
      },
    });

    res.status(201).json(newReport);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export const getAllReportByTrainerId = async (req, res) => {
    console.log('Fetching reports for trainer ID:', req.params.trainerId);
  try {
    const { trainerId } = req.params;
    const parsedTrainerId = parseInt(trainerId, 10);

    const reports = await prisma.report.findMany({
      where: { trainerId: parsedTrainerId },
      include: {
        student: {
            include: {
                user: true,
            },
        },
        activity: true,
      },
    });

    if (reports.length === 0) {
      return res.status(404).json({ message: 'No reports found for this trainer.' });
    }

    console.log("Reports from database:", reports);

    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};