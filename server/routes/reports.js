import express from 'express';
import { getAllReportByTrainerId } from '../controllers/reports.js';

const reportRoutes = express.Router();

reportRoutes.get('/trainer/:trainerId', getAllReportByTrainerId);

export default reportRoutes;