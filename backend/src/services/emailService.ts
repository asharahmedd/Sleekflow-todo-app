import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// Create transporter
let transporter: Transporter | null = null;

export const initializeEmailService = (): void => {
  if (process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'true') {
    console.log('Email notifications are disabled');
    return;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '2525'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  console.log('Email service initialized');
};

export const getTransporter = (): Transporter => {
  if (!transporter) {
    throw new Error('Email service not initialized');
  }
  return transporter;
};

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  if (process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'true') {
    console.log('Email notifications disabled - would have sent:', options.subject);
    return;
  }

  try {
    const transporter = getTransporter();
    
    await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || stripHtml(options.html),
    });

    console.log(`Email sent to ${options.to}: ${options.subject}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Helper to strip HTML tags for plain text version
const stripHtml = (html: string): string => {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
};

// Email template wrapper
const getEmailTemplate = (content: string): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f4f4f7;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 28px;
      font-weight: 800;
    }
    .content {
      padding: 40px 30px;
      color: #2c3e50;
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      padding: 20px 30px;
      background-color: #f4f4f7;
      text-align: center;
      color: #7f8c8d;
      font-size: 12px;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .todo-card {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 16px 20px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .todo-card h3 {
      margin: 0 0 8px 0;
      color: #2c3e50;
    }
    .todo-card p {
      margin: 4px 0;
      color: #7f8c8d;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      margin-right: 8px;
    }
    .priority-high {
      background: #ff6b6b;
      color: white;
    }
    .priority-medium {
      background: #ffd93d;
      color: #2c3e50;
    }
    .priority-low {
      background: #6bcf7f;
      color: white;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>📝 SleekFlow Todo</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>You're receiving this email because you're using SleekFlow Todo App.</p>
      <p><a href="${process.env.APP_URL}/settings">Manage email preferences</a> | <a href="${process.env.APP_URL}">Open App</a></p>
      <p>&copy; ${new Date().getFullYear()} SleekFlow Todo. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Email Templates

export const sendTodoSharedEmail = async (
  toEmail: string,
  toName: string,
  fromName: string,
  todoName: string,
  todoId: string
): Promise<void> => {
  const content = `
    <h2>👥 A todo was shared with you!</h2>
    <p>Hi ${toName},</p>
    <p><strong>${fromName}</strong> has shared a todo with you.</p>
    
    <div class="todo-card">
      <h3>${todoName}</h3>
    </div>
    
    <a href="${process.env.APP_URL}/todos" class="button">View Todo</a>
    
    <p>You can now view and edit this todo in your dashboard.</p>
  `;

  await sendEmail({
    to: toEmail,
    subject: `${fromName} shared a todo with you`,
    html: getEmailTemplate(content),
  });
};

export const sendCommentNotificationEmail = async (
  toEmail: string,
  toName: string,
  commenterName: string,
  todoName: string,
  commentContent: string,
  todoId: string
): Promise<void> => {
  const content = `
    <h2>💬 New comment on your todo</h2>
    <p>Hi ${toName},</p>
    <p><strong>${commenterName}</strong> commented on "${todoName}"</p>
    
    <div class="todo-card">
      <h3>${todoName}</h3>
      <p><strong>${commenterName}:</strong> ${commentContent}</p>
    </div>
    
    <a href="${process.env.APP_URL}/todos" class="button">View Comment</a>
  `;

  await sendEmail({
    to: toEmail,
    subject: `${commenterName} commented on "${todoName}"`,
    html: getEmailTemplate(content),
  });
};

export const sendDueSoonReminderEmail = async (
  toEmail: string,
  toName: string,
  todoName: string,
  todoDescription: string,
  todoPriority: string,
  dueDate: Date,
  hoursUntilDue: number
): Promise<void> => {
  const priorityBadge = `<span class="badge priority-${todoPriority.toLowerCase()}">${todoPriority} Priority</span>`;
  
  const content = `
    <h2>⏰ Todo due soon!</h2>
    <p>Hi ${toName},</p>
    <p>Your todo is due in <strong>${hoursUntilDue} hours</strong>.</p>
    
    <div class="todo-card">
      <h3>${todoName}</h3>
      <p>${priorityBadge}</p>
      <p>${todoDescription}</p>
      <p><strong>Due:</strong> ${dueDate.toLocaleDateString()} at ${dueDate.toLocaleTimeString()}</p>
    </div>
    
    <a href="${process.env.APP_URL}/todos" class="button">View Todo</a>
    
    <p>Don't forget to complete it on time!</p>
  `;

  await sendEmail({
    to: toEmail,
    subject: `⏰ Reminder: "${todoName}" is due soon`,
    html: getEmailTemplate(content),
  });
};

export const sendOverdueReminderEmail = async (
  toEmail: string,
  toName: string,
  todoName: string,
  todoDescription: string,
  todoPriority: string,
  dueDate: Date
): Promise<void> => {
  const priorityBadge = `<span class="badge priority-${todoPriority.toLowerCase()}">${todoPriority} Priority</span>`;
  
  const content = `
    <h2>🚨 Todo is overdue!</h2>
    <p>Hi ${toName},</p>
    <p>Your todo is now <strong>overdue</strong>.</p>
    
    <div class="todo-card">
      <h3>${todoName}</h3>
      <p>${priorityBadge}</p>
      <p>${todoDescription}</p>
      <p><strong>Was due:</strong> ${dueDate.toLocaleDateString()} at ${dueDate.toLocaleTimeString()}</p>
    </div>
    
    <a href="${process.env.APP_URL}/todos" class="button">Complete Now</a>
  `;

  await sendEmail({
    to: toEmail,
    subject: `🚨 Overdue: "${todoName}"`,
    html: getEmailTemplate(content),
  });
};

export const sendDailyDigestEmail = async (
  toEmail: string,
  toName: string,
  stats: {
    totalTodos: number;
    completedToday: number;
    dueToday: number;
    overdue: number;
  },
  todayTodos: Array<{ name: string; priority: string; dueDate: Date }>
): Promise<void> => {
  const todosList = todayTodos
    .map((todo) => {
      const priorityBadge = `<span class="badge priority-${todo.priority.toLowerCase()}">${todo.priority}</span>`;
      return `
        <div class="todo-card">
          <h3>${todo.name}</h3>
          <p>${priorityBadge} Due: ${todo.dueDate.toLocaleDateString()}</p>
        </div>
      `;
    })
    .join('');

  const content = `
    <h2>📊 Your Daily Todo Summary</h2>
    <p>Hi ${toName},</p>
    <p>Here's your daily update for ${new Date().toLocaleDateString()}:</p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Total Todos:</strong> ${stats.totalTodos}</p>
      <p><strong>Completed Today:</strong> ${stats.completedToday} ✅</p>
      <p><strong>Due Today:</strong> ${stats.dueToday}</p>
      <p><strong>Overdue:</strong> ${stats.overdue} 🚨</p>
    </div>
    
    ${todayTodos.length > 0 ? `<h3>Todos Due Today:</h3>${todosList}` : '<p>No todos due today! 🎉</p>'}
    
    <a href="${process.env.APP_URL}/todos" class="button">Open App</a>
  `;

  await sendEmail({
    to: toEmail,
    subject: `📊 Your Daily Todo Summary - ${new Date().toLocaleDateString()}`,
    html: getEmailTemplate(content),
  });
};

export const sendWeeklyDigestEmail = async (
  toEmail: string,
  toName: string,
  stats: {
    completedThisWeek: number;
    createdThisWeek: number;
    currentTotal: number;
  }
): Promise<void> => {
  const content = `
    <h2>📈 Your Weekly Todo Report</h2>
    <p>Hi ${toName},</p>
    <p>Here's your progress for this week:</p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Todos Completed:</strong> ${stats.completedThisWeek} ✅</p>
      <p><strong>New Todos Created:</strong> ${stats.createdThisWeek}</p>
      <p><strong>Currently Active:</strong> ${stats.currentTotal}</p>
    </div>
    
    <p>${stats.completedThisWeek > 0 ? 'Great job this week! Keep up the momentum! 🚀' : 'Let\'s make next week more productive! 💪'}</p>
    
    <a href="${process.env.APP_URL}/todos" class="button">View All Todos</a>
  `;

  await sendEmail({
    to: toEmail,
    subject: `📈 Your Weekly Todo Report`,
    html: getEmailTemplate(content),
  });
};
