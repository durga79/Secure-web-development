import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/session';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const sessionData = await requireAuth();

    if (sessionData.role === 'STUDENT') {
      const enrollments = await prisma.enrollment.findMany({
        where: { userId: sessionData.userId },
        include: {
          course: {
            include: {
              assignments: {
                orderBy: { dueDate: 'asc' },
                include: {
                  submissions: {
                    where: { studentId: sessionData.userId },
                  },
                },
              },
            },
          },
        },
      });

      const upcomingAssignments = enrollments
        .flatMap((enrollment) =>
          enrollment.course.assignments.map((assignment) => ({
            ...assignment,
            course: {
              id: enrollment.course.id,
              code: enrollment.course.code,
              name: enrollment.course.name,
            },
            submission: assignment.submissions[0] || null,
          }))
        )
        .filter((assignment) => {
          if (!assignment.dueDate) return true;
          return new Date(assignment.dueDate) >= new Date();
        })
        .slice(0, 10);

      const recentSubmissions = await prisma.submission.findMany({
        where: { studentId: sessionData.userId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          assignment: {
            include: {
              course: true,
            },
          },
        },
      });

      return NextResponse.json({
        enrollments: enrollments.map((e) => ({
          id: e.id,
          course: e.course,
        })),
        upcomingAssignments,
        recentSubmissions,
      });
    } else {
      const stats = await prisma.$transaction([
        prisma.user.count({ where: { role: 'STUDENT' } }),
        prisma.course.count(),
        prisma.assignment.count(),
        prisma.submission.count({ where: { status: 'SUBMITTED' } }),
      ]);

      const recentSubmissions = await prisma.submission.findMany({
        where: { status: 'SUBMITTED' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignment: {
            include: {
              course: true,
            },
          },
        },
      });

      return NextResponse.json({
        stats: {
          totalStudents: stats[0],
          totalCourses: stats[1],
          totalAssignments: stats[2],
          pendingSubmissions: stats[3],
        },
        recentSubmissions,
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.error('Get dashboard error', { error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

