import prisma from '../config/db.js';

export const getAllReportByTrainerId = async (req, res) => {
    console.log('Fetching reports for trainer ID:', req.params.trainerId);
  try {
    const { trainerId } = req.params;
    const parsedTrainerId = parseInt(trainerId, 10);

    const reports = await prisma.report.findMany({
      where: { trainerId: parsedTrainerId },
      include: {
        student: true,
        activity: true,
      },
    });

    if (reports.length === 0) {
      return res.status(404).json({ message: 'No reports found for this trainer.' });
    }

    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};