import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLES } from './config';
import { AuditLog, AuditLogSchema } from './schemas';
import { v4 as uuidv4 } from 'uuid';

export async function createAuditLog(
  auditData: Omit<AuditLog, 'logId' | 'timestamp'>
): Promise<void> {
  const auditLog: AuditLog = {
    ...auditData,
    logId: uuidv4(),
    timestamp: new Date().toISOString(),
  };

  // Validate data
  const validatedLog = AuditLogSchema.parse(auditLog);

  try {
    await docClient.send(new PutCommand({
      TableName: TABLES.AUDIT_LOG,
      Item: validatedLog,
    }));
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw error for audit logs to avoid disrupting main operations
  }
}

export async function getAuditLogs(
  entityId: string,
  entityType?: AuditLog['entityType']
): Promise<AuditLog[]> {
  try {
    // Implementation would depend on your GSI structure
    // This is a simplified version
    return [];
  } catch (error) {
    console.error('Error getting audit logs:', error);
    return [];
  }
}
