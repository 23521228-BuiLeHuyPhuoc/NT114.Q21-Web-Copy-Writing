import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CustomerContentDetail } from './ContentDetail';
import {
  contentService,
  type UiContent,
  type UpdateContentPayload,
} from '@/services/contentService';
import { contentKeys } from '@/hooks/queries/useContents';

let activeTestId: string | undefined = 'art-detail-123';

const mockNavigate = vi.fn<(to: string) => void>();
vi.mock('@/lib/next-router-compat', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: activeTestId }),
  useLocation: () => ({ pathname: `/contents/${activeTestId}`, search: '', hash: '' }),
}));

const mockToastSuccess = vi.fn<(msg: string) => void>();
const mockToastError = vi.fn<(msg: string) => void>();
vi.mock('react-hot-toast', () => ({
  default: {
    success: (msg: string) => mockToastSuccess(msg),
    error: (msg: string) => mockToastError(msg),
  },
  toast: {
    success: (msg: string) => mockToastSuccess(msg),
    error: (msg: string) => mockToastError(msg),
  },
}));

vi.mock('@/app/components/Layout', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-layout">{children}</div>,
}));

vi.mock('@tinymce/tinymce-react', () => ({
  Editor: ({
    value,
    onEditorChange,
    disabled,
  }: {
    value: string;
    onEditorChange?: (val: string) => void;
    disabled?: boolean;
  }) => (
    <textarea
      data-testid="mock-tinymce-editor"
      value={value}
      disabled={disabled}
      onChange={(e) => onEditorChange?.(e.target.value)}
    />
  ),
}));

function createSampleDetail(id: string, title: string, content = '<p>Nội dung ban đầu</p>'): UiContent {
  return {
    id,
    title,
    content,
    prompt: 'Prompt bài viết',
    type: 'headline',
    industry: 'ecommerce',
    model: 'Gemini Flash',
    quality: 92,
    words: 40,
    plagiarismScore: 0,
    originalityScore: 100,
    plagiarismRiskLevel: 'safe',
    plagiarismCheckStatus: 'completed',
    plagiarismReportId: null,
    plagiarismCheckedAt: null,
    tokens: 160,
    latency: '1.1s',
    tone: 'urgent',
    createdAt: '2026-10-05',
    updatedAt: '2026-10-05',
    createdAtRaw: '2026-10-05T00:00:00.000Z',
    updatedAtRaw: '2026-10-05T00:00:00.000Z',
    status: 'published',
    project: null,
    tags: ['ecommerce'],
    isFavorite: false,
    isProjectCompleted: false,
    isDeleted: false,
    deletedAt: null,
    versions: [{ id: 1, label: 'Phiên bản 1', quality: 92, selected: true }],
  };
}

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: Error) => void;
}

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('CustomerContentDetail Integration Tests (Group B: D01 - D12)', () => {
  let queryClient: QueryClient;
  const mockGet = vi.fn();
  const mockUpdate = vi.fn();
  const mockRemove = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    activeTestId = 'art-detail-123';
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    contentService.get = mockGet;
    contentService.update = mockUpdate;
    contentService.remove = mockRemove;

    let currentDetail = createSampleDetail('art-detail-123', 'Bản thảo chi tiết');
    mockGet.mockImplementation(async () => currentDetail);
    mockUpdate.mockImplementation(async (id: string, payload: UpdateContentPayload) => {
      currentDetail = createSampleDetail(
        id,
        payload.title ?? currentDetail.title,
        payload.outputText ?? currentDetail.content
      );
      return currentDetail;
    });
    mockRemove.mockImplementation(async () => currentDetail);
  });

  afterEach(() => {
    cleanup();
    queryClient.clear();
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <CustomerContentDetail />
      </QueryClientProvider>
    );

  // D01: Seed cache từ Generator hiển thị ngay lập tức, không nhấp nháy loading
  it('D01: Seed cache từ Generator hiển thị bài ngay lập tức khi service fetch đang deferred, không nhấp nháy loading', async () => {
    const cachedItem = createSampleDetail('art-detail-123', 'Bài từ Generator', '<h2>Tiêu đề bài từ Generator</h2>');
    queryClient.setQueryData(contentKeys.detail('art-detail-123'), cachedItem);

    const deferred = createDeferred<UiContent>();
    mockGet.mockReturnValue(deferred.promise);

    renderComponent();

    expect(screen.getByText('Bài từ Generator')).toBeDefined();
    expect(screen.queryByText(/Đang mở bản thảo.../i)).toBeNull();
    expect(screen.queryByText(/Không tìm thấy bản thảo/i)).toBeNull();
    expect(screen.queryByText(/Không thể tải bản thảo/i)).toBeNull();
  });

  // D02: Loading khi chưa có cache
  it('D02: Chưa có cache và request đang pending thì hiển thị loading', async () => {
    const deferred = createDeferred<UiContent>();
    mockGet.mockReturnValue(deferred.promise);

    renderComponent();

    expect(screen.getByText(/Đang mở bản thảo.../i)).toBeDefined();

    await act(async () => {
      deferred.resolve(createSampleDetail('art-detail-123', 'Bản thảo đã tải'));
    });

    await waitFor(() => {
      expect(screen.getByText('Bản thảo đã tải')).toBeDefined();
    });
    expect(screen.queryByText(/Đang mở bản thảo.../i)).toBeNull();
  });

  // D03a: 404 hiển thị Không tìm thấy bản thảo, không có nút Thử lại
  it('D03a: 404 hiển thị Không tìm thấy bản thảo, không có nút Thử lại', async () => {
    const err404 = Object.assign(new Error('Content not found'), {
      response: { status: 404 },
    });
    mockGet.mockRejectedValueOnce(err404);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Không tìm thấy bản thảo')).toBeDefined();
    });
    expect(screen.getByText(/Nội dung không tồn tại hoặc tài khoản hiện tại không có quyền truy cập/i)).toBeDefined();
    expect(screen.queryByRole('button', { name: /Thử lại/i })).toBeNull();
  });

  // D03b: Lỗi mạng hiển thị Không thể tải bản thảo và có nút Thử lại
  it('D03b: Lỗi mạng hiển thị Không thể tải bản thảo và có nút Thử lại để gọi lại service', async () => {
    const netErr = new Error('Lỗi kết nối cơ sở dữ liệu MongoDB');
    mockGet.mockRejectedValueOnce(netErr);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Không thể tải bản thảo')).toBeDefined();
    });
    expect(screen.getByText('Lỗi kết nối cơ sở dữ liệu MongoDB')).toBeDefined();
    expect(screen.queryByText(/Nội dung không tồn tại/i)).toBeNull();

    const retryBtn = screen.getByRole('button', { name: /Thử lại/i });
    expect(retryBtn).toBeDefined();

    mockGet.mockResolvedValueOnce(createSampleDetail('art-detail-123', 'Bản thảo đã phục hồi'));
    await act(async () => {
      fireEvent.click(retryBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('Bản thảo đã phục hồi')).toBeDefined();
    });
    expect(screen.queryByText('Không thể tải bản thảo')).toBeNull();
    expect(mockGet).toHaveBeenCalledTimes(2);
  });

  // D04: Render Rich Text an toàn (HTML sanitize) và nhánh Markdown
  it('D04a: HTML hợp lệ hiển thị rich-text và sanitize script/event handler nguy hiểm', async () => {
    const richContent = createSampleDetail(
      'art-detail-123',
      'Bài Rich Text',
      '<h2>Tiêu đề con</h2><p>Đoạn văn <strong>in đậm</strong></p><script>window.__detail_xss = 1;</script><img src="invalid" onerror="window.__detail_onerror = 1;" /><a href="javascript:alert(1)">Link</a>'
    );
    mockGet.mockResolvedValueOnce(richContent);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Bài Rich Text')).toBeDefined();
    });

    const richTextEl = document.querySelector('.rich-text');
    expect(richTextEl).not.toBeNull();
    expect(richTextEl?.innerHTML).toContain('<h2>Tiêu đề con</h2>');
    expect(richTextEl?.innerHTML).toContain('<strong>in đậm</strong>');
    expect(richTextEl?.innerHTML).not.toContain('<script>');
    expect(document.querySelector('script')).toBeNull();
    expect(document.querySelector('[onerror]')).toBeNull();
    expect(document.querySelector('a[href^="javascript:"]')).toBeNull();
  });

  it('D04b: Nội dung dạng Markdown/plain text đi đúng nhánh render Markdown component', async () => {
    const markdownContent = createSampleDetail(
      'art-detail-123',
      'Bài Markdown',
      '# Tiêu đề Markdown thuần túy\n\nĐây là đoạn văn bản markdown.'
    );
    mockGet.mockResolvedValueOnce(markdownContent);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Bài Markdown')).toBeDefined();
    });

    expect(document.querySelector('.rich-text--compact')).not.toBeNull();
    expect(document.querySelector('.rich-text:not(.rich-text--compact)')).toBeNull();
    expect(screen.getByText('Đây là đoạn văn bản markdown.')).toBeDefined();
  });

  // D05: Edit và Cancel khôi phục snapshot ban đầu
  it('D05: Vào edit lấy đúng title/content; sửa rồi Cancel phải khôi phục đúng snapshot ban đầu', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Bản thảo chi tiết')).toBeDefined();
    });

    const editToggleBtn = screen.getByRole('button', { name: /Chỉnh sửa/i });
    await act(async () => {
      fireEvent.click(editToggleBtn);
    });

    const titleInput = screen.getByDisplayValue('Bản thảo chi tiết') as HTMLInputElement;
    const editor = screen.getByTestId('mock-tinymce-editor') as HTMLTextAreaElement;

    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Tiêu đề đã sửa dở dang' } });
      fireEvent.change(editor, { target: { value: '<p>Nội dung sửa dở dang</p>' } });
    });

    const cancelBtn = screen.getByRole('button', { name: /Hủy/i });
    await act(async () => {
      fireEvent.click(cancelBtn);
    });

    expect(screen.getByText('Bản thảo chi tiết')).toBeDefined();
    expect(screen.queryByDisplayValue('Tiêu đề đã sửa dở dang')).toBeNull();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Chỉnh sửa/i }));
    });
    expect((screen.getByDisplayValue('Bản thảo chi tiết') as HTMLInputElement).value).toBe('Bản thảo chi tiết');
  });

  // D06: Update success gửi đúng payload, giữ nguyên HTML, cập nhật preview và cache
  it('D06: Lưu chỉnh sửa thành công gửi đúng { id, payload }, giữ nguyên HTML và cập nhật giao diện', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Bản thảo chi tiết')).toBeDefined();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Chỉnh sửa/i }));
    });

    const titleInput = screen.getByDisplayValue('Bản thảo chi tiết');
    const editor = screen.getByTestId('mock-tinymce-editor');

    const updatedHtml = '<h3>Tiêu đề cập nhật</h3><p>Nội dung <em>đã cập nhật</em> với &amp; entity</p>';
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Tiêu đề đã lưu mới' } });
      fireEvent.change(editor, { target: { value: updatedHtml } });
    });

    const saveBtn = screen.getByRole('button', { name: /^Lưu$/i });
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockUpdate).toHaveBeenCalledWith('art-detail-123', {
      title: 'Tiêu đề đã lưu mới',
      outputText: updatedHtml,
    });
    expect(mockToastSuccess).toHaveBeenCalledWith('Đã lưu chỉnh sửa!');

    await waitFor(() => {
      expect(screen.getByText('Tiêu đề đã lưu mới')).toBeDefined();
    });
  });

  // D07: Update pending và toàn bộ điều khiển bị khóa
  it('D07: Double-click Lưu chỉ gửi 1 request; nút Lưu, Hủy, title input, Editor và nút Xóa bị disable khi pending', async () => {
    const deferredUpdate = createDeferred<UiContent>();
    mockUpdate.mockReturnValueOnce(deferredUpdate.promise);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Bản thảo chi tiết')).toBeDefined();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Chỉnh sửa/i }));
    });

    const saveBtn = screen.getByRole('button', { name: /^Lưu$/i }) as HTMLButtonElement;
    const cancelBtn = screen.getByRole('button', { name: /Hủy/i }) as HTMLButtonElement;
    const titleInput = screen.getByDisplayValue('Bản thảo chi tiết') as HTMLInputElement;
    const editor = screen.getByTestId('mock-tinymce-editor') as HTMLTextAreaElement;
    const deleteBtn = screen.getByRole('button', { name: /Xóa bài viết/i }) as HTMLButtonElement;

    // Double-click Lưu
    await act(async () => {
      fireEvent.click(saveBtn);
      fireEvent.click(saveBtn);
    });

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect((screen.getByRole('button', { name: /^Lưu$/i }) as HTMLButtonElement).disabled).toBe(true);
    });
    expect(cancelBtn.disabled).toBe(true);
    expect(titleInput.disabled).toBe(true);
    expect(editor.disabled).toBe(true);
    expect(deleteBtn.disabled).toBe(true);
    expect(mockToastSuccess).not.toHaveBeenCalled();

    await act(async () => {
      deferredUpdate.resolve(createSampleDetail('art-detail-123', 'Tiêu đề xong'));
    });

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Đã lưu chỉnh sửa!');
    });
  });

  // D08: Update failure giữ nguyên draft, báo lỗi, mở khóa và cho phép retry
  it('D08: Update thất bại giữ nguyên draft người dùng nhập, hiện lỗi, mở khóa và cho retry', async () => {
    mockUpdate.mockRejectedValueOnce(new Error('Lỗi cập nhật server 500'));

    renderComponent();

    await waitFor(() => screen.getByRole('button', { name: /Chỉnh sửa/i }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Chỉnh sửa/i }));
    });

    const titleInput = screen.getByDisplayValue('Bản thảo chi tiết') as HTMLInputElement;
    const editor = screen.getByTestId('mock-tinymce-editor') as HTMLTextAreaElement;

    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Bản draft cần retry' } });
      fireEvent.change(editor, { target: { value: '<p>Nội dung draft cần retry</p>' } });
    });

    const saveBtn = screen.getByRole('button', { name: /^Lưu$/i }) as HTMLButtonElement;
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Lỗi cập nhật server 500');
    });

    expect(titleInput.value).toBe('Bản draft cần retry');
    expect(editor.value).toBe('<p>Nội dung draft cần retry</p>');
    expect(saveBtn.disabled).toBe(false);

    mockUpdate.mockResolvedValueOnce(createSampleDetail('art-detail-123', 'Bản draft cần retry', '<p>Nội dung draft cần retry</p>'));
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    expect(mockUpdate).toHaveBeenCalledTimes(2);
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Đã lưu chỉnh sửa!');
    });
  });

  // D09: Validation tiêu đề rỗng, nội dung rỗng / HTML không chữ, biên độ dài 60.000 ký tự
  it('D09: Chặn tiêu đề rỗng, nội dung rỗng hoặc HTML không chữ; chấp nhận 60.000 ký tự và chặn 60.001 ký tự', async () => {
    renderComponent();

    await waitFor(() => screen.getByRole('button', { name: /Chỉnh sửa/i }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Chỉnh sửa/i }));
    });

    const titleInput = screen.getByDisplayValue('Bản thảo chi tiết') as HTMLInputElement;
    const editor = screen.getByTestId('mock-tinymce-editor') as HTMLTextAreaElement;
    const saveBtn = screen.getByRole('button', { name: /^Lưu$/i });

    // 1. Tiêu đề rỗng
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: '   ' } });
    });
    await act(async () => {
      fireEvent.click(saveBtn);
    });
    expect(mockToastError).toHaveBeenCalledWith('Tiêu đề và nội dung không được để trống');
    expect(mockUpdate).not.toHaveBeenCalled();
    mockToastError.mockClear();

    // 2. Nội dung rỗng hoặc HTML chỉ có tag/khoảng trắng
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Tiêu đề hợp lệ' } });
      fireEvent.change(editor, { target: { value: '<p>  <br/>  </p>' } });
    });
    await act(async () => {
      fireEvent.click(saveBtn);
    });
    expect(mockToastError).toHaveBeenCalledWith('Tiêu đề và nội dung không được để trống');
    expect(mockUpdate).not.toHaveBeenCalled();
    mockToastError.mockClear();

    // 3. Biên độ dài: 60.001 ký tự bị chặn
    const overLimitContent = '<p>' + 'a'.repeat(60000) + '</p>';
    await act(async () => {
      fireEvent.change(editor, { target: { value: overLimitContent } });
    });
    await act(async () => {
      fireEvent.click(saveBtn);
    });
    expect(mockToastError).toHaveBeenCalledWith('Nội dung tối đa 60.000 ký tự');
    expect(mockUpdate).not.toHaveBeenCalled();
    mockToastError.mockClear();

    // 4. Biên độ dài: Đúng 60.000 ký tự được chấp nhận
    const exactLimitContent = 'a'.repeat(60000);
    await act(async () => {
      fireEvent.change(editor, { target: { value: exactLimitContent } });
    });
    await act(async () => {
      fireEvent.click(saveBtn);
    });
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockToastError).not.toHaveBeenCalled();
  });

  // D10: Delete pending, double-click, failure và retry
  it('D10: Deferred delete chống double-click, khóa nút khi pending, xử lý lỗi và retry thành công', async () => {
    const deferredDelete = createDeferred<UiContent>();
    mockRemove.mockReturnValueOnce(deferredDelete.promise);

    renderComponent();

    await waitFor(() => screen.getByRole('button', { name: /Chỉnh sửa/i }));

    const deleteBtn = screen.getByRole('button', { name: /Xóa bài viết/i }) as HTMLButtonElement;
    const editBtn = screen.getByRole('button', { name: /Chỉnh sửa/i }) as HTMLButtonElement;

    // Double-click xóa liên tiếp
    await act(async () => {
      fireEvent.click(deleteBtn);
      fireEvent.click(deleteBtn);
    });

    // Chỉ gọi remove đúng 1 lần
    expect(mockRemove).toHaveBeenCalledTimes(1);
    expect(mockRemove).toHaveBeenCalledWith('art-detail-123');

    // Nút xóa và chỉnh sửa bị khóa trong lúc pending
    await waitFor(() => {
      expect((screen.getByRole('button', { name: /Xóa bài viết/i }) as HTMLButtonElement).disabled).toBe(true);
    });
    expect(editBtn.disabled).toBe(true);
    expect(mockToastSuccess).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();

    // Lần 1: Reject lỗi xóa
    await act(async () => {
      deferredDelete.reject(new Error('Lỗi database MongoDB'));
    });

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Lỗi database MongoDB');
    });
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByText('Bản thảo chi tiết')).toBeDefined();
    expect((screen.getByRole('button', { name: /Xóa bài viết/i }) as HTMLButtonElement).disabled).toBe(false);

    // Lần 2: Retry xóa thành công
    mockRemove.mockResolvedValueOnce(createSampleDetail('art-detail-123', 'Đã xóa'));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Xóa bài viết/i }));
    });

    expect(mockRemove).toHaveBeenCalledTimes(2);
    expect(mockToastSuccess).toHaveBeenCalledWith('Đã đưa nội dung vào thùng rác!');
    expect(mockNavigate).toHaveBeenCalledWith('/contents');
  });

  // D11: Route ID thiếu hoặc không hợp lệ không crash
  it('D11: Route ID không có thì hiển thị màn hình không tìm thấy, không crash', async () => {
    activeTestId = '';

    renderComponent();

    expect(screen.getByText(/Không tìm thấy bản thảo/i)).toBeDefined();
    expect(mockGet).not.toHaveBeenCalled();
  });

  // D12: Cross-mutation synchronous guards (Update pending chặn Delete; Delete pending chặn Update)
  it('D12: Cross-mutation guards chặn xung đột đồng thời trong cùng một tick', async () => {
    // 1. Khi Update đang pending: click Delete bị chặn ngay lập tức
    const deferredUpdate = createDeferred<UiContent>();
    mockUpdate.mockReturnValueOnce(deferredUpdate.promise);

    renderComponent();

    await waitFor(() => screen.getByRole('button', { name: /Chỉnh sửa/i }));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Chỉnh sửa/i }));
    });

    const saveBtn = screen.getByRole('button', { name: /^Lưu$/i });
    const deleteBtn = screen.getByRole('button', { name: /Xóa bài viết/i });

    await act(async () => {
      fireEvent.click(saveBtn);
      // Ngay trong cùng lượt gọi Delete
      fireEvent.click(deleteBtn);
    });

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockRemove).not.toHaveBeenCalled(); // Delete bị chặn bởi isSavingRef

    await act(async () => {
      deferredUpdate.resolve(createSampleDetail('art-detail-123', 'Đã lưu'));
    });

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Đã lưu chỉnh sửa!');
    });

    // 2. Khi Delete đang pending: click Save bị chặn ngay lập tức
    const deferredDelete = createDeferred<UiContent>();
    mockRemove.mockReturnValueOnce(deferredDelete.promise);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Chỉnh sửa/i }));
    });

    const editSaveBtn = screen.getByRole('button', { name: /^Lưu$/i });
    const deleteBtnAgain = screen.getByRole('button', { name: /Xóa bài viết/i });

    await act(async () => {
      fireEvent.click(deleteBtnAgain);
      // Ngay trong cùng lượt gọi Save
      fireEvent.click(editSaveBtn);
    });

    expect(mockRemove).toHaveBeenCalledTimes(1);
    expect(mockUpdate).toHaveBeenCalledTimes(1); // Không gọi thêm lần 2 từ click Save

    await act(async () => {
      deferredDelete.resolve(createSampleDetail('art-detail-123', 'Đã xóa'));
    });

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Đã đưa nội dung vào thùng rác!');
    });
  });
});
