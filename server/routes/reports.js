import express from 'express';
import { getAllReportByTrainerId, createNewReport } from '../controllers/reports.js';

const reportRoutes = express.Router();

reportRoutes.post('/', createNewReport);
reportRoutes.get('/trainer/:trainerId', getAllReportByTrainerId);

export default reportRoutes;