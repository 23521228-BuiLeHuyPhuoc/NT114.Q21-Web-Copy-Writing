import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { persistGeneratedContent } from './persistGeneratedContent';
import type { CreateContentPayload, UpdateContentPayload, UiContent } from '@/services/contentService';

describe('persistGeneratedContent (Unit Suite)', () => {
  const dummyBaseCreatePayload: Omit<CreateContentPayload, 'outputText'> = {
    title: 'Tiêu đề chiến dịch F&B',
    prompt: 'Viết bài quảng cáo cà phê',
    type: 'social',
    tone: 'friendly',
    language: 'vi',
    modelUsed: 'gemini-flash',
    tags: ['ecommerce'],
    projectId: 'proj-123',
    templateId: 'tpl-456',
  };

  const createDummyUiContent = (id: string, outputText: string, title = dummyBaseCreatePayload.title): UiContent => ({
    id,
    title,
    content: outputText,
    prompt: dummyBaseCreatePayload.prompt,
    type: dummyBaseCreatePayload.type,
    industry: 'ecommerce',
    model: 'Gemini Flash',
    quality: 95,
    words: outputText.split(/\s+/).filter(Boolean).length,
    plagiarismScore: 0,
    originalityScore: 100,
    plagiarismRiskLevel: 'safe',
    plagiarismCheckStatus: 'completed',
    plagiarismReportId: null,
    plagiarismCheckedAt: null,
    tokens: 150,
    latency: '1.2s',
    tone: dummyBaseCreatePayload.tone || 'friendly',
    createdAt: '2026-10-05',
    updatedAt: '2026-10-05',
    status: 'published',
    project: dummyBaseCreatePayload.projectId || null,
    tags: dummyBaseCreatePayload.tags || [],
    isFavorite: false,
    isProjectCompleted: false,
    isDeleted: false,
    deletedAt: null,
    versions: [{ id: 1, label: 'Phiên bản 1', quality: 95, selected: true }],
  });

  let mockUpdateContentFn: Mock<(args: { id: string; payload: UpdateContentPayload }) => Promise<UiContent>>;
  let mockCreateContentFn: Mock<(payload: CreateContentPayload) => Promise<UiContent>>;

  beforeEach(() => {
    // Khởi tạo mới mock function trước từng test để bảo đảm độc lập 100%
    mockUpdateContentFn = vi.fn(async ({ id, payload }: { id: string; payload: UpdateContentPayload }) => {
      return createDummyUiContent(id, payload.outputText || '');
    });

    mockCreateContentFn = vi.fn(async (payload: CreateContentPayload) => {
      return createDummyUiContent('new-article-id', payload.outputText, payload.title);
    });
  });

  it('H01: Chọn nhánh CREATE khi existingArticleId là null/undefined', async () => {
    const rawHtml = '<p>Nội dung <strong>bài riêng mới</strong></p>';

    const result = await persistGeneratedContent({
      existingArticleId: null,
      rawHtml,
      createPayload: dummyBaseCreatePayload,
      updateContentFn: mockUpdateContentFn,
      createContentFn: mockCreateContentFn,
    });

    expect(mockCreateContentFn).toHaveBeenCalledTimes(1);
    expect(mockUpdateContentFn).not.toHaveBeenCalled();
    expect(mockCreateContentFn).toHaveBeenCalledWith({
      ...dummyBaseCreatePayload,
      outputText: rawHtml,
    });
    expect(result.id).toBe('new-article-id');
  });

  it('H02: Chọn nhánh UPDATE đúng ID bài riêng khi existingArticleId có giá trị', async () => {
    const existingArticleId = 'article-sep-456';
    const editedHtml = '<p>Nội dung <em>đã sửa</em></p>';

    const result = await persistGeneratedContent({
      existingArticleId,
      rawHtml: editedHtml,
      createPayload: dummyBaseCreatePayload,
      updateContentFn: mockUpdateContentFn,
      createContentFn: mockCreateContentFn,
    });

    expect(mockUpdateContentFn).toHaveBeenCalledTimes(1);
    expect(mockCreateContentFn).not.toHaveBeenCalled();
    expect(mockUpdateContentFn).toHaveBeenCalledWith({
      id: existingArticleId,
      payload: { outputText: editedHtml },
    });
    expect(result.id).toBe(existingArticleId);
  });

  it('H03: Bảo toàn nguyên vẹn raw HTML tiếng Việt, entity và đầy đủ metadata khi create', async () => {
    const complexHtml = [
      '<h3>Cà Phê Rang Xay Nguyên Bản &amp; Đậm Đà</h3>',
      '<p>Hương vị <strong>truyền thống</strong> hòa quyện cùng <em>sữa tươi béo ngậy</em>.</p>',
      '<ul>',
      '  <li>100% hạt Robusta Đắk Lắk</li>',
      '  <li>Ưu đãi: <strong>Giảm 25%</strong> cho đơn hàng hôm nay</li>',
      '</ul>',
    ].join('\n');

    let capturedPayload: CreateContentPayload | null = null;
    mockCreateContentFn = vi.fn(async (payload: CreateContentPayload) => {
      capturedPayload = payload;
      return createDummyUiContent('article-rich-html', payload.outputText, payload.title);
    });

    const result = await persistGeneratedContent({
      existingArticleId: null,
      rawHtml: complexHtml,
      createPayload: dummyBaseCreatePayload,
      updateContentFn: mockUpdateContentFn,
      createContentFn: mockCreateContentFn,
    });

    expect(capturedPayload).not.toBeNull();
    expect(capturedPayload!.outputText).toBe(complexHtml);
    expect(capturedPayload!.title).toBe(dummyBaseCreatePayload.title);
    expect(capturedPayload!.prompt).toBe(dummyBaseCreatePayload.prompt);
    expect(capturedPayload!.type).toBe(dummyBaseCreatePayload.type);
    expect(capturedPayload!.tone).toBe(dummyBaseCreatePayload.tone);
    expect(capturedPayload!.language).toBe('vi');
    expect(capturedPayload!.modelUsed).toBe('gemini-flash');
    expect(capturedPayload!.tags).toEqual(['ecommerce']);
    expect(capturedPayload!.projectId).toBe('proj-123');
    expect(capturedPayload!.templateId).toBe('tpl-456');
    expect(result.id).toBe('article-rich-html');
  });

  it('H04: Ném lỗi khi nội dung rỗng hoặc chỉ có thẻ HTML không chữ', async () => {
    const emptyHtml = '<p>   <br/>  </p>';

    await expect(
      persistGeneratedContent({
        existingArticleId: null,
        rawHtml: emptyHtml,
        createPayload: dummyBaseCreatePayload,
        updateContentFn: mockUpdateContentFn,
        createContentFn: mockCreateContentFn,
      })
    ).rejects.toThrow('Không có nội dung để lưu');

    expect(mockCreateContentFn).not.toHaveBeenCalled();
    expect(mockUpdateContentFn).not.toHaveBeenCalled();
  });

  it('H05: Ném lỗi khi response thiếu ID hợp lệ (empty hoặc null), không che giấu lỗi', async () => {
    mockCreateContentFn = vi.fn(async (payload: CreateContentPayload) => {
      return createDummyUiContent('', payload.outputText); // ID rỗng
    });

    await expect(
      persistGeneratedContent({
        existingArticleId: null,
        rawHtml: '<p>Nội dung</p>',
        createPayload: dummyBaseCreatePayload,
        updateContentFn: mockUpdateContentFn,
        createContentFn: mockCreateContentFn,
      })
    ).rejects.toThrow('Response không có ID bài viết hợp lệ');

    // Giả lập boundary cast khi response từ backend thiếu field ID
    mockCreateContentFn = vi.fn(async (payload: CreateContentPayload) => {
      return {
        ...createDummyUiContent('dummy', payload.outputText),
        id: null,
      } as unknown as UiContent;
    });

    await expect(
      persistGeneratedContent({
        existingArticleId: null,
        rawHtml: '<p>Nội dung</p>',
        createPayload: dummyBaseCreatePayload,
        updateContentFn: mockUpdateContentFn,
        createContentFn: mockCreateContentFn,
      })
    ).rejects.toThrow('Response không có ID bài viết hợp lệ');
  });

  it('H06: Propagate lỗi khi create mutation reject', async () => {
    mockCreateContentFn = vi.fn().mockRejectedValue(new Error('Lỗi database backend'));

    await expect(
      persistGeneratedContent({
        existingArticleId: null,
        rawHtml: '<p>Nội dung</p>',
        createPayload: dummyBaseCreatePayload,
        updateContentFn: mockUpdateContentFn,
        createContentFn: mockCreateContentFn,
      })
    ).rejects.toThrow('Lỗi database backend');
  });

  it('H07: Propagate lỗi khi update mutation reject', async () => {
    mockUpdateContentFn = vi.fn().mockRejectedValue(new Error('Network timeout khi update'));

    await expect(
      persistGeneratedContent({
        existingArticleId: 'article-123',
        rawHtml: '<p>Nội dung sửa</p>',
        createPayload: dummyBaseCreatePayload,
        updateContentFn: mockUpdateContentFn,
        createContentFn: mockCreateContentFn,
      })
    ).rejects.toThrow('Network timeout khi update');
  });
});
