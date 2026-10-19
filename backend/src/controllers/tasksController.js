import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getTasks(req, res) {
  try {
    const { assignee, status } = req.query;
    const where = {};
    if (assignee) where.assignee = assignee;
    if (status) where.status = status;

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200
    });

    return sendSuccess(res, tasks, 'قائمة المهام وكانبان');
  } catch (error) {
    return sendError(res, 'فشل جلب المهام: ' + error.message, 500);
  }
}

export async function createTask(req, res) {
  try {
    const { title, description, type = 'عامة', priority = 'عادية', dueDate, assignee, customerCode } = req.body;
    if (!title) return sendError(res, 'عنوان المهمة مطلوب.', 400);

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        type,
        priority,
        dueDate: dueDate || null,
        assignee: assignee || req.user.name,
        customerCode: customerCode || null,
        status: 'جديدة'
      }
    });

    return sendSuccess(res, task, 'تم إنشاء المهمة بنجاح.', 201);
  } catch (error) {
    return sendError(res, 'تعذر إنشاء المهمة: ' + error.message, 500);
  }
}

export async function updateTaskStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const task = await prisma.task.update({
      where: { id },
      data: { status }
    });

    return sendSuccess(res, task, 'تم تحديث حالة المهمة.');
  } catch (error) {
    return sendError(res, 'تعذر تحديث المهمة: ' + error.message, 500);
  }
}
