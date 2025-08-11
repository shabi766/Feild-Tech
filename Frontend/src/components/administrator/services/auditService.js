class AuditService {
  constructor() {
    this.baseURL = import.meta.env.VITE_BACKEND_URL;
    this.token = localStorage.getItem('token');
  }

  // Get auth headers
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  // Log administrative action
  async logAction(action, details, targetType, targetId, userId) {
    try {
      const auditEntry = {
        action,
        details,
        targetType,
        targetId,
        userId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ipAddress: await this.getClientIP(),
        sessionId: this.getSessionId()
      };

      const response = await fetch(`${this.baseURL}/api/v1/admin/audit/log`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(auditEntry)
      });

      if (!response.ok) {
        console.error('Failed to log audit entry:', response.statusText);
      }

      return response.ok;
    } catch (error) {
      console.error('Error logging audit entry:', error);
      return false;
    }
  }

  // Log KYC actions
  async logKYCAction(action, requestId, reason = '', adminNotes = '') {
    return this.logAction(
      `KYC_${action.toUpperCase()}`,
      {
        requestId,
        reason,
        adminNotes,
        actionType: action
      },
      'KYC_REQUEST',
      requestId,
      this.getCurrentUserId()
    );
  }

  // Log user management actions
  async logUserAction(action, userId, reason = '', adminNotes = '') {
    return this.logAction(
      `USER_${action.toUpperCase()}`,
      {
        userId,
        reason,
        adminNotes,
        actionType: action
      },
      'USER',
      userId,
      this.getCurrentUserId()
    );
  }

  // Log system settings changes
  async logSettingsChange(category, oldValue, newValue, adminNotes = '') {
    return this.logAction(
      'SETTINGS_UPDATE',
      {
        category,
        oldValue,
        newValue,
        adminNotes
      },
      'SYSTEM_SETTINGS',
      category,
      this.getCurrentUserId()
    );
  }

  // Log security events
  async logSecurityEvent(event, details, severity = 'INFO') {
    return this.logAction(
      `SECURITY_${event.toUpperCase()}`,
      {
        ...details,
        severity,
        eventType: event
      },
      'SECURITY',
      'SYSTEM',
      this.getCurrentUserId()
    );
  }

  // Log login/logout events
  async logAuthEvent(event, details = {}) {
    return this.logAction(
      `AUTH_${event.toUpperCase()}`,
      {
        ...details,
        eventType: event
      },
      'AUTHENTICATION',
      'SYSTEM',
      this.getCurrentUserId()
    );
  }

  // Log data export events
  async logDataExport(exportType, filters, recordCount) {
    return this.logAction(
      'DATA_EXPORT',
      {
        exportType,
        filters,
        recordCount,
        timestamp: new Date().toISOString()
      },
      'DATA_EXPORT',
      exportType,
      this.getCurrentUserId()
    );
  }

  // Log bulk operations
  async logBulkOperation(operation, targetType, recordCount, filters, results) {
    return this.logAction(
      `BULK_${operation.toUpperCase()}`,
      {
        targetType,
        recordCount,
        filters,
        results,
        operationType: operation
      },
      'BULK_OPERATION',
      targetType,
      this.getCurrentUserId()
    );
  }

  // Get audit logs with filtering
  async getAuditLogs(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.action) queryParams.append('action', filters.action);
      if (filters.targetType) queryParams.append('targetType', filters.targetType);
      if (filters.userId) queryParams.append('userId', filters.userId);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.severity) queryParams.append('severity', filters.severity);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.offset) queryParams.append('offset', filters.offset);

      const response = await fetch(
        `${this.baseURL}/api/v1/admin/audit/logs?${queryParams.toString()}`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch audit logs: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  }

  // Export audit logs
  async exportAuditLogs(filters = {}, format = 'csv') {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.action) queryParams.append('action', filters.action);
      if (filters.targetType) queryParams.append('targetType', filters.targetType);
      if (filters.userId) queryParams.append('userId', filters.userId);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.severity) queryParams.append('severity', filters.severity);
      queryParams.append('format', format);

      const response = await fetch(
        `${this.baseURL}/api/v1/admin/audit/export?${queryParams.toString()}`,
        { 
          headers: this.getHeaders(),
          responseType: 'blob'
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to export audit logs: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Log the export action
      await this.logDataExport(format, filters, 'exported');

      return true;
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      throw error;
    }
  }

  // Get audit statistics
  async getAuditStats(timeRange = '24h') {
    try {
      const response = await fetch(
        `${this.baseURL}/api/v1/admin/audit/stats?timeRange=${timeRange}`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch audit stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching audit stats:', error);
      throw error;
    }
  }

  // Utility methods
  getCurrentUserId() {
    // This should be implemented based on your auth context
    // For now, we'll try to get it from localStorage or context
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.id || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  getSessionId() {
    return localStorage.getItem('sessionId') || 'unknown';
  }

  async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  // Real-time audit log monitoring
  startRealTimeMonitoring(callback) {
    // This could be implemented with WebSocket or Server-Sent Events
    // For now, we'll use polling
    const interval = setInterval(async () => {
      try {
        const logs = await this.getAuditLogs({ limit: 10 });
        if (callback && typeof callback === 'function') {
          callback(logs);
        }
      } catch (error) {
        console.error('Real-time monitoring error:', error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }
}

// Create singleton instance
const auditService = new AuditService();

export default auditService;
