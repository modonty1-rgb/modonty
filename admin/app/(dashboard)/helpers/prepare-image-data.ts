interface ImageUploadResult {
  socialImageUrl?: string;
  socialImageAlt?: string;
  cloudinaryPublicId?: string;
}

interface PreparedImageData {
  finalSocialImage: string | null | undefined;
  finalSocialImageAlt: string | null | undefined;
  finalCloudinaryPublicId: string | null | undefined;
}

export function prepareImageData(
  isEdit: boolean,
  isRemoved: boolean,
  hasNewFile: boolean,
  uploadResult?: ImageUploadResult
): PreparedImageData {
  const hasUploadResult = uploadResult?.socialImageUrl && uploadResult?.cloudinaryPublicId;

  if (isEdit) {
    if (isRemoved && !hasNewFile) {
      return {
        finalSocialImage: null,
        finalSocialImageAlt: null,
        finalCloudinaryPublicId: null,
      };
    }
    if (hasUploadResult) {
      return {
        finalSocialImage: uploadResult.socialImageUrl,
        finalSocialImageAlt: uploadResult.socialImageAlt,
        finalCloudinaryPublicId: uploadResult.cloudinaryPublicId,
      };
    }
  } else {
    if (hasUploadResult) {
      return {
        finalSocialImage: uploadResult.socialImageUrl,
        finalSocialImageAlt: uploadResult.socialImageAlt,
        finalCloudinaryPublicId: uploadResult.cloudinaryPublicId,
      };
    }
  }

  return {
    finalSocialImage: undefined,
    finalSocialImageAlt: undefined,
    finalCloudinaryPublicId: undefined,
  };
}
