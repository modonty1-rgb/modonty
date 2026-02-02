export function formatFieldValue(value: any): string {
  if (value === null || value === undefined) {
    return 'Not set';
  }

  if (typeof value === 'string') {
    if (value === '') return 'Not set';
    
    // Handle JSON strings
    if ((value.startsWith('{') || value.startsWith('[')) && value.length > 100) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return `JSON Array (${parsed.length} items)`;
        }
        return `JSON Object (${Object.keys(parsed).length} properties)`;
      } catch {
        // Not valid JSON, treat as regular string
      }
    }
    
    if (value.length > 100) {
      return value.substring(0, 100) + '...';
    }
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (value instanceof Date) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return 'Empty array';
    
    // Show first few items for string arrays
    if (value.length <= 3 && value.every(item => typeof item === 'string')) {
      return value.join(', ');
    }
    
    return `${value.length} item${value.length > 1 ? 's' : ''}`;
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return 'Empty object';
    
    // Special handling for common object types
    if ('hreflang' in value && 'url' in value) {
      return `${value.hreflang}: ${value.url}`;
    }
    
    return `Object (${keys.length} properties)`;
  }

  return String(value);
}

export function isFieldSet(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  if (typeof value === 'object' && Object.keys(value).length === 0) return false;
  return true;
}

export function getFieldDisplayValue(value: any, maxLength: number = 50): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    if (value === '') return '';
    if (value.length > maxLength) {
      return value.substring(0, maxLength) + '...';
    }
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (value instanceof Date) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '';
    return `[${value.length}]`;
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return '';
    return `{${keys.length}}`;
  }

  return String(value);
}
