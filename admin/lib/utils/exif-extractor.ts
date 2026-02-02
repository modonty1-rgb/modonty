import exifr from "exifr";

export interface EXIFData {
  dateCreated?: Date;
  cameraModel?: string;
  cameraMake?: string;
  iso?: number;
  aperture?: number;
  shutterSpeed?: string;
  focalLength?: number;
  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsAltitude?: number;
  fullData?: Record<string, unknown>; // Full EXIF data for storage
}

/**
 * Extracts EXIF data from an image file
 * @param file - The File object to extract EXIF data from
 * @returns Promise<EXIFData> - Structured EXIF data
 */
export async function extractEXIFData(file: File): Promise<EXIFData | null> {
  try {
    // Only process image files
    if (!file.type.startsWith("image/")) {
      return null;
    }

    // Extract EXIF data using exifr
    const exifData = await exifr.parse(file, {
      // Extract specific fields we need
      pick: [
        "DateTimeOriginal",
        "CreateDate",
        "ModifyDate",
        "Make",
        "Model",
        "ISO",
        "FNumber",
        "ExposureTime",
        "FocalLength",
        "GPSLatitude",
        "GPSLongitude",
        "GPSAltitude",
      ],
      // Also get full data for storage
      translateKeys: false,
      translateValues: false,
    });

    if (!exifData) {
      return null;
    }

    const result: EXIFData = {
      fullData: exifData,
    };

    // Extract date created (prefer DateTimeOriginal, fallback to CreateDate)
    if (exifData.DateTimeOriginal) {
      result.dateCreated = new Date(exifData.DateTimeOriginal);
    } else if (exifData.CreateDate) {
      result.dateCreated = new Date(exifData.CreateDate);
    }

    // Extract camera information
    if (exifData.Make) {
      result.cameraMake = String(exifData.Make);
    }
    if (exifData.Model) {
      result.cameraModel = String(exifData.Model);
    }

    // Extract photography settings
    if (exifData.ISO) {
      result.iso = Number(exifData.ISO);
    }
    if (exifData.FNumber) {
      result.aperture = Number(exifData.FNumber);
    }
    if (exifData.ExposureTime) {
      result.shutterSpeed = String(exifData.ExposureTime);
    }
    if (exifData.FocalLength) {
      result.focalLength = Number(exifData.FocalLength);
    }

    // Extract GPS coordinates
    if (exifData.GPSLatitude !== undefined && exifData.GPSLongitude !== undefined) {
      result.gpsLatitude = Number(exifData.GPSLatitude);
      result.gpsLongitude = Number(exifData.GPSLongitude);
    }
    if (exifData.GPSAltitude !== undefined) {
      result.gpsAltitude = Number(exifData.GPSAltitude);
    }

    return result;
  } catch (error) {
    // Silently fail if EXIF extraction fails (file might not have EXIF data)
    console.warn("Failed to extract EXIF data:", error);
    return null;
  }
}
