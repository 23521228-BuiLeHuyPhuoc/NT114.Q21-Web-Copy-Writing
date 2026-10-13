import type { CreateContentPayload, UpdateContentPayload, UiContent } from '@/services/contentService';
import { htmlToPlainText } from '@/lib/richText';

export interface PersistGeneratedContentParams {
  /**
   * ID của bài viết riêng cho phiên bản đang chọn (nếu đã lưu trước đó).
   * Tuyệt đối KHÔNG truyền ID của bản gộp gốc vào đây.
   */
  existingArticleId?: string | null;
  rawHtml: string;
  createPayload: Omit<CreateContentPayload, 'outputText'>;
  updateContentFn: (args: { id: string; payload: UpdateContentPayload }) => Promise<UiContent>;
  createContentFn: (payload: CreateContentPayload) => Promise<UiContent>;
}

/**
 * Lưu phiên bản nội dung đang chọn lên backend.
 *
 * Nguyên tắc danh tính (Batch 1.1):
 * 1. Nếu existingArticleId có giá trị: gọi updateContentFn để cập nhật đúng bài riêng đó.
 * 2. Nếu existingArticleId là null/undefined: gọi createContentFn để tạo một bài riêng mới.
 * 3. Tuyệt đối KHÔNG lấy originalBundleId làm fallback cho existingArticleId.
 * 4. Bảo toàn nguyên vẹn raw HTML trong cả hai nhánh (không strip tag, không plain text).
 * 5. Kiểm tra tính hợp lệ của response ID; nếu thiếu ID, ném lỗi và không trả về ID giả mạo.
 * 6. Propagate lỗi trực tiếp khi mutation thất bại để caller xử lý toast và dừng navigation.
 */
export async function persistGeneratedContent({
  existingArticleId,
  rawHtml,
  createPayload,
  updateContentFn,
  createContentFn,
}: PersistGeneratedContentParams): Promise<UiContent> {
  const articleId = existingArticleId ?? null;
  const textContent = htmlToPlainText(rawHtml).trim();
  if (!textContent) {
    throw new Error('Không có nội dung để lưu');
  }

  const result = articleId
    ? await updateContentFn({
        id: articleId,
        payload: {
          outputText: rawHtml,
        },
      })
    : await createContentFn({
        ...createPayload,
        outputText: rawHtml,
      });

  if (!result || typeof result.id !== 'string' || !result.id.trim()) {
    throw new Error('Response không có ID bài viết hợp lệ');
  }

  return result;
}
