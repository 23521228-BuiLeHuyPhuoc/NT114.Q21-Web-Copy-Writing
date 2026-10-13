import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act, cleanup, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CustomerContents } from './Contents';
import {
  contentService,
  type UiContent,
} from '@/services/contentService';
import { contentKeys } from '@/hooks/queries/useContents';

// 1. Mock router compat
const mockNavigate = vi.fn<(to: string) => void>();
vi.mock('@/lib/next-router-compat', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/contents', search: '', hash: '' }),
  useParams: () => ({}),
}));

// 2. Mock toast
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

// 3. Mock Layout
vi.mock('@/app/components/Layout', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-layout">{children}</div>,
}));

// Helper tạo dữ liệu dummy chuẩn UiContent
function createSampleContent(id: string, title: string, content = '<p>Nội dung mẫu</p>', status: UiContent['status'] = 'published'): UiContent {
  return {
    id,
    title,
    content,
    prompt: 'Prompt bài viết',
    type: 'headline',
    industry: 'ecommerce',
    model: 'Gemini Flash',
    quality: 90,
    words: 30,
    plagiarismScore: 0,
    originalityScore: 100,
    plagiarismRiskLevel: 'safe',
    plagiarismCheckStatus: 'completed',
    plagiarismReportId: null,
    plagiarismCheckedAt: null,
    tokens: 150,
    latency: '1.2s',
    tone: 'urgent',
    createdAt: '2026-10-05',
    updatedAt: '2026-10-05',
    createdAtRaw: '2026-10-05T00:00:00.000Z',
    updatedAtRaw: '2026-10-05T00:00:00.000Z',
    status,
    project: null,
    tags: ['ecommerce'],
    isFavorite: false,
    isProjectCompleted: false,
    isDeleted: false,
    deletedAt: null,
    versions: [{ id: 1, label: 'Phiên bản 1', quality: 90, selected: true }],
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

describe('CustomerContents Integration Tests (Group A: L01 - L09 & Group C: T01 - T06)', () => {
  let queryClient: QueryClient;
  const mockList = vi.fn();
  const mockListTrash = vi.fn();
  const mockRemove = vi.fn();
  const mockRestore = vi.fn();
  const mockPermanentDelete = vi.fn();
  const mockPermanentDeleteMany = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    contentService.list = mockList;
    contentService.listTrash = mockListTrash;
    contentService.remove = mockRemove;
    contentService.restore = mockRestore;
    contentService.permanentDelete = mockPermanentDelete;
    contentService.permanentDeleteMany = mockPermanentDeleteMany;

    mockList.mockResolvedValue([
      createSampleContent('art-1', 'Bài viết một'),
      createSampleContent('art-2', 'Bài viết hai'),
    ]);
    mockListTrash.mockResolvedValue([]);
  });

  afterEach(() => {
    cleanup();
    queryClient.clear();
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <CustomerContents />
      </QueryClientProvider>
    );

  // --- NHÓM A: DANH SÁCH /contents ---

  // L01: Loading -> success
  it('L01: Loading hiển thị đúng trong lúc fetch; sau khi resolve hiển thị danh sách bài', async () => {
    const deferred = createDeferred<UiContent[]>();
    mockList.mockReturnValueOnce(deferred.promise);

    renderComponent();

    expect(screen.getByText(/Đang tải nội dung.../i)).toBeDefined();

    await act(async () => {
      deferred.resolve([
        createSampleContent('art-10', 'Bài viết thành công'),
      ]);
    });

    await waitFor(() => {
      expect(screen.getByText('Bài viết thành công')).toBeDefined();
    });
    expect(screen.queryByText(/Đang tải nội dung.../i)).toBeNull();
  });

  // L02: Empty state
  it('L02: Danh sách rỗng hiển thị đúng EmptyState và không crash', async () => {
    mockList.mockResolvedValueOnce([]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Không tìm thấy bản thảo/i)).toBeDefined();
    });
    expect(screen.getByText(/Thư viện bản thảo/i)).toBeDefined();
  });

  // L03: Error state loại trừ empty state và dữ liệu cũ, có nút Thử lại
  it('L03: Lỗi fetch hiển thị thông báo lỗi, không đồng thời hiển thị empty state hay card bài, nút Thử lại phục hồi danh sách', async () => {
    mockList.mockRejectedValueOnce(new Error('Lỗi kết nối cơ sở dữ liệu MongoDB'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Không thể tải danh sách nội dung/i)).toBeDefined();
    });

    // Các state loại trừ nhau: không hiển thị empty state và không hiển thị card bài viết
    expect(screen.queryByText(/Không tìm thấy bản thảo/i)).toBeNull();
    expect(screen.queryByText('Bài viết một')).toBeNull();

    // Bấm nút thử lại
    mockList.mockResolvedValueOnce([
      createSampleContent('art-recovered', 'Bài viết đã phục hồi'),
    ]);

    const retryBtn = screen.getByRole('button', { name: /Thử lại/i });
    await act(async () => {
      fireEvent.click(retryBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('Bài viết đã phục hồi')).toBeDefined();
    });
    expect(screen.queryByText(/Không thể tải danh sách nội dung/i)).toBeNull();
    expect(mockList).toHaveBeenCalledTimes(2);
  });

  // L04: Search và filter, ký tự regex đặc biệt không gây crash
  it('L04: Tìm kiếm lọc đúng bài; ký tự đặc biệt như [, (, +, *, ?, \\ không gây crash', async () => {
    mockList.mockResolvedValueOnce([
      createSampleContent('art-regex', 'Quảng cáo [Hot] + Giảm giá (100%*)? Chi tiết\\'),
      createSampleContent('art-normal', 'Tiêu đề thông thường'),
    ]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Quảng cáo \[Hot\]/i)).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText(/Tìm kiếm nội dung.../i);

    for (const char of ['[', '(', '+', '*', '?', '\\']) {
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: char } });
      });
      expect(screen.getByText(/Quảng cáo \[Hot\]/i)).toBeDefined();
      expect(screen.queryByText('Tiêu đề thông thường')).toBeNull();
    }
  });

  // L05: Pagination reset về trang hợp lệ khi filter thay đổi
  it('L05: Thay đổi search hoặc filter đưa pagination về trang 1, không sinh trang trắng', async () => {
    const items = Array.from({ length: 15 }, (_, i) =>
      createSampleContent(`art-page-${i + 1}`, `Bài viết số ${i + 1}`, '<p>Nội dung</p>', i < 12 ? 'published' : 'draft')
    );
    mockList.mockResolvedValueOnce(items);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Bài viết số 1')).toBeDefined();
    });

    const nextBtn = screen.getByRole('link', { name: /Trang sau/i });
    await act(async () => {
      fireEvent.click(nextBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('Bài viết số 11')).toBeDefined();
    });
    expect(screen.queryByText('Bài viết số 1')).toBeNull();

    const searchInput = screen.getByPlaceholderText(/Tìm kiếm nội dung.../i);
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Bài viết số 1' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Bài viết số 1')).toBeDefined();
    });
  });

  // L06: HTML preview an toàn, kiểm tra text, không có raw tags, loại bỏ script/onerror/javascript
  it('L06: Text nội dung an toàn hiển thị đúng; raw tag không hiển thị dạng text; script, onerror và javascript URL bị loại bỏ hoàn toàn', async () => {
    mockList.mockResolvedValueOnce([
      createSampleContent(
        'art-xss',
        'Bài viết kiểm tra XSS',
        '<script>window.__xss_test = true;</script><p>Nội dung an toàn</p><img src="x" onerror="window.__xss_onerror=1" /><a href="javascript:alert(1)">Link nguy hiểm</a>'
      ),
    ]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Bài viết kiểm tra XSS')).toBeDefined();
    });

    // 1. Text an toàn thực sự xuất hiện
    expect(screen.getByText(/Nội dung an toàn/i)).toBeDefined();

    // 2. Raw tag <p>, <script> không xuất hiện dưới dạng text trên màn hình
    expect(screen.queryByText(/<script>/i)).toBeNull();
    expect(screen.queryByText(/<p>/i)).toBeNull();

    // 3. Không có thẻ script, thuộc tính onerror hoặc liên kết javascript trong DOM
    expect(document.querySelector('script')).toBeNull();
    expect(document.querySelector('[onerror]')).toBeNull();
    expect(document.querySelector('a[href^="javascript:"]')).toBeNull();
    expect((window as unknown as { __xss_test?: boolean }).__xss_test).toBeUndefined();
  });

  // L07: Delete pending và chống double-click
  it('L07: Double-click xóa chỉ gửi 1 request; nút xóa bị disable trong lúc pending', async () => {
    const deferredDelete = createDeferred<UiContent>();
    mockRemove.mockReturnValueOnce(deferredDelete.promise);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Bài viết một')).toBeDefined();
    });

    const deleteBtn = screen.getByRole('button', { name: /Xóa Bài viết một/i }) as HTMLButtonElement;

    await act(async () => {
      fireEvent.click(deleteBtn);
      fireEvent.click(deleteBtn);
    });

    expect(mockRemove).toHaveBeenCalledTimes(1);
    expect(mockRemove).toHaveBeenCalledWith('art-1');
    await waitFor(() => {
      expect((screen.getByRole('button', { name: /Xóa Bài viết một/i }) as HTMLButtonElement).disabled).toBe(true);
    });
    expect(mockToastSuccess).not.toHaveBeenCalled();

    await act(async () => {
      deferredDelete.resolve(createSampleContent('art-1', 'Bài viết một'));
    });

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Đã đưa nội dung vào thùng rác!');
    });
  });

  // L08: Delete failure và retry
  it('L08: Xóa thất bại giữ nguyên bài viết trên màn hình, mở khóa và cho phép retry', async () => {
    mockRemove.mockRejectedValueOnce(new Error('Lỗi server khi xóa'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Bài viết một')).toBeDefined();
    });

    const deleteBtn = screen.getByRole('button', { name: /Xóa Bài viết một/i }) as HTMLButtonElement;
    await act(async () => {
      fireEvent.click(deleteBtn);
    });

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Lỗi server khi xóa');
    });
    expect(mockToastSuccess).not.toHaveBeenCalled();
    expect(screen.getByText('Bài viết một')).toBeDefined();
    expect(deleteBtn.disabled).toBe(false);

    mockRemove.mockResolvedValueOnce(createSampleContent('art-1', 'Bài viết một'));
    await act(async () => {
      fireEvent.click(deleteBtn);
    });

    expect(mockRemove).toHaveBeenCalledTimes(2);
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Đã đưa nội dung vào thùng rác!');
    });
  });

  // L09: Delete success kích hoạt invalidate và làm mới danh sách
  it('L09: Xóa thành công kích hoạt invalidate và bài viết biến mất khỏi danh sách', async () => {
    mockRemove.mockResolvedValueOnce(createSampleContent('art-1', 'Bài viết một'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Bài viết một')).toBeDefined();
    });

    mockList.mockResolvedValueOnce([
      createSampleContent('art-2', 'Bài viết hai'),
    ]);

    const deleteBtn = screen.getByRole('button', { name: /Xóa Bài viết một/i });
    await act(async () => {
      fireEvent.click(deleteBtn);
    });

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Đã đưa nội dung vào thùng rác!');
    });

    await waitFor(() => {
      expect(screen.queryByText('Bài viết một')).toBeNull();
    });
    expect(screen.getByText('Bài viết hai')).toBeDefined();
  });

  // --- NHÓM C: THÙNG RÁC (TRASH BIN) ---

  // T01: Loading, empty, error và retry trong thùng rác
  it('T01a: Khi query thùng rác đang pending thì modal hiển thị loading', async () => {
    const deferredTrash = createDeferred<UiContent[]>();
    mockListTrash.mockReturnValueOnce(deferredTrash.promise);

    renderComponent();

    const openTrashBtn = screen.getByRole('button', { name: /Thùng rác/i });
    await act(async () => {
      fireEvent.click(openTrashBtn);
    });

    expect(screen.getByText(/Đang tải thùng rác.../i)).toBeDefined();

    await act(async () => {
      deferredTrash.resolve([]);
    });

    await waitFor(() => {
      expect(screen.getByText(/Thùng rác trống/i)).toBeDefined();
    });
    expect(screen.queryByText(/Đang tải thùng rác.../i)).toBeNull();
  });

  it('T01b: Khi query thùng rác resolve rỗng thì hiển thị empty state', async () => {
    mockListTrash.mockResolvedValueOnce([]);

    renderComponent();

    const openTrashBtn = screen.getByRole('button', { name: /Thùng rác/i });
    await act(async () => {
      fireEvent.click(openTrashBtn);
    });

    expect(screen.getByText(/0 nội dung đã xóa/i)).toBeDefined();
    expect(screen.getByText(/Thùng rác trống/i)).toBeDefined();
    expect(screen.queryByText(/Không thể tải thùng rác/i)).toBeNull();
  });

  it('T01c: Khi query thùng rác bị reject thì hiển thị thông báo lỗi, không đồng thời hiển thị empty state, có nút Thử lại để phục hồi', async () => {
    mockListTrash.mockRejectedValueOnce(new Error('Lỗi kết nối MongoDB'));

    renderComponent();

    const openTrashBtn = screen.getByRole('button', { name: /Thùng rác/i });
    await act(async () => {
      fireEvent.click(openTrashBtn);
    });

    await waitFor(() => {
      expect(screen.getByText(/Không thể tải thùng rác. Vui lòng thử lại./i)).toBeDefined();
    });

    // Không đồng thời hiển thị empty state
    expect(screen.queryByText(/Thùng rác trống/i)).toBeNull();

    // Bấm nút Thử lại trong thùng rác
    const trashedItem = createSampleContent('art-in-trash', 'Bài phục hồi trong rác');
    trashedItem.isDeleted = true;
    mockListTrash.mockResolvedValueOnce([trashedItem]);

    const retryTrashBtn = screen.getByRole('button', { name: /Thử lại/i });
    await act(async () => {
      fireEvent.click(retryTrashBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('Bài phục hồi trong rác')).toBeDefined();
    });
    expect(screen.queryByText(/Không thể tải thùng rác/i)).toBeNull();
    expect(mockListTrash).toHaveBeenCalledTimes(2);
  });

  // T02: Luồng xóa mềm thực sự: danh sách chính có bài A, trash rỗng -> người dùng xóa A -> remove resolve -> refetch làm A biến mất khỏi list chính và xuất hiện trong trash
  it('T02: Luồng xóa mềm thực sự: bấm xóa ở danh sách chính, mutation remove thực thi, refetch cập nhật đúng query keys và bài xuất hiện trong thùng rác', async () => {
    const itemA = createSampleContent('art-soft-del', 'Bài viết cần xóa mềm');
    mockList.mockResolvedValueOnce([itemA]);
    mockListTrash.mockResolvedValueOnce([]);

    renderComponent();

    // 1. Danh sách chính ban đầu có bài A
    await waitFor(() => {
      expect(screen.getByText('Bài viết cần xóa mềm')).toBeDefined();
    });

    // 2. Trash ban đầu rỗng (badge không có hoặc không có số mục)
    expect(screen.queryByText('Bài viết trong rác')).toBeNull();

    // Cấu hình mock sau khi remove: list chính rỗng, trash trả về bài A với isDeleted: true
    const trashedItemA = {
      ...itemA,
      isDeleted: true,
      deletedAt: '2026-10-05T12:00:00.000Z',
    };
    mockRemove.mockResolvedValueOnce(trashedItemA);
    mockList.mockResolvedValueOnce([]);
    mockListTrash.mockResolvedValueOnce([trashedItemA]);

    // 3. Người dùng bấm xóa bài A
    const deleteBtn = screen.getByRole('button', { name: /Xóa Bài viết cần xóa mềm/i });
    await act(async () => {
      fireEvent.click(deleteBtn);
    });

    // 4. contentService.remove('art-soft-del') được gọi và resolve
    expect(mockRemove).toHaveBeenCalledTimes(1);
    expect(mockRemove).toHaveBeenCalledWith('art-soft-del');

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Đã đưa nội dung vào thùng rác!');
    });

    // 6. Assert bài A biến mất khỏi danh sách chính
    await waitFor(() => {
      expect(screen.queryByText('Bài viết cần xóa mềm')).toBeNull();
    });

    // 7. Mở thùng rác và assert bài A xuất hiện
    const openTrashBtn = screen.getByRole('button', { name: /Thùng rác/i });
    await act(async () => {
      fireEvent.click(openTrashBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('Bài viết cần xóa mềm')).toBeDefined();
    });
    expect(screen.getByText(/1 nội dung đã xóa/i)).toBeDefined();

    // 8. Assert cả list và trash đều đã được gọi lại (refetched theo contentKeys.all)
    expect(mockList).toHaveBeenCalledTimes(2);
    expect(mockListTrash).toHaveBeenCalledTimes(2);
  });

  // T03: Restore (deferred double-click, khóa pending, failure, retry, đồng bộ danh sách)
  it('T03: Khôi phục bài từ thùng rác chống double-click, xử lý lỗi, retry thành công và đồng bộ cả thùng rác lẫn danh sách chính', async () => {
    const trashedItem = createSampleContent('art-restore-me', 'Bài cần khôi phục');
    trashedItem.isDeleted = true;
    mockList.mockResolvedValueOnce([]);
    mockListTrash.mockResolvedValueOnce([trashedItem]);

    renderComponent();

    const openTrashBtn = screen.getByRole('button', { name: /Thùng rác/i });
    await act(async () => {
      fireEvent.click(openTrashBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('Bài cần khôi phục')).toBeDefined();
    });

    // 1. Double-click Restore với deferred promise
    const deferredRestore = createDeferred<UiContent>();
    mockRestore.mockReturnValueOnce(deferredRestore.promise);

    const restoreBtn = screen.getByRole('button', { name: /Khôi phục/i }) as HTMLButtonElement;
    const permDeleteBtn = screen.getByRole('button', { name: /Xóa vĩnh viễn/i }) as HTMLButtonElement;

    await act(async () => {
      fireEvent.click(restoreBtn);
      fireEvent.click(restoreBtn);
    });

    // Chỉ gửi duy nhất 1 request
    expect(mockRestore).toHaveBeenCalledTimes(1);
    expect(mockRestore).toHaveBeenCalledWith('art-restore-me');

    // Nút restore và các thao tác xung đột bị disable khi pending
    await waitFor(() => {
      expect((screen.getByRole('button', { name: /Khôi phục/i }) as HTMLButtonElement).disabled).toBe(true);
    });
    expect(permDeleteBtn.disabled).toBe(true);
    expect(mockToastSuccess).not.toHaveBeenCalled();

    // 2. Reject lỗi khôi phục
    await act(async () => {
      deferredRestore.reject(new Error('Lỗi server khi khôi phục'));
    });

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Lỗi server khi khôi phục');
    });
    expect(screen.getByText('Bài cần khôi phục')).toBeDefined();
    expect((screen.getByRole('button', { name: /Khôi phục/i }) as HTMLButtonElement).disabled).toBe(false);

    // 3. Retry khôi phục thành công
    const restoredItem = { ...trashedItem, isDeleted: false, deletedAt: null };
    mockRestore.mockResolvedValueOnce(restoredItem);
    mockListTrash.mockResolvedValueOnce([]);
    mockList.mockResolvedValueOnce([restoredItem]);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Khôi phục/i }));
    });

    expect(mockRestore).toHaveBeenCalledTimes(2);
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Đã khôi phục nội dung!');
    });

    // Bài biến mất khỏi trash
    await waitFor(() => {
      expect(screen.getByText(/Thùng rác trống/i)).toBeDefined();
    });

    // Đóng trash và assert bài xuất hiện lại ở danh sách chính
    const closeTrashBtn = screen.getByRole('button', { name: /Đóng thùng rác/i });
    await act(async () => {
      fireEvent.click(closeTrashBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('Bài cần khôi phục')).toBeDefined();
    });
  });

  // T04: Permanent delete có confirm, pending và retry
  it('T04: Xóa vĩnh viễn hỏi confirm; hủy không gọi API; xác nhận rồi double-click chỉ gửi 1 request, lỗi cho retry, thành công xóa khỏi trash và không đưa vào danh sách chính', async () => {
    const trashedItem = createSampleContent('art-perm-del', 'Bài xóa vĩnh viễn');
    trashedItem.isDeleted = true;
    mockList.mockResolvedValueOnce([]);
    mockListTrash.mockResolvedValueOnce([trashedItem]);

    const confirmSpy = vi.spyOn(window, 'confirm');

    renderComponent();

    const openTrashBtn = screen.getByRole('button', { name: /Thùng rác/i });
    await act(async () => {
      fireEvent.click(openTrashBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('Bài xóa vĩnh viễn')).toBeDefined();
    });

    const permDeleteBtn = screen.getByRole('button', { name: /Xóa vĩnh viễn/i });

    // 1. Người dùng Cancel confirm -> không gọi API
    confirmSpy.mockReturnValueOnce(false);
    await act(async () => {
      fireEvent.click(permDeleteBtn);
    });
    expect(mockPermanentDelete).not.toHaveBeenCalled();

    // 2. Người dùng đồng ý confirm nhưng request pending + double click
    confirmSpy.mockReturnValue(true);
    const deferredPermDelete = createDeferred<{ id: string }>();
    mockPermanentDelete.mockReturnValueOnce(deferredPermDelete.promise);

    await act(async () => {
      fireEvent.click(permDeleteBtn);
      fireEvent.click(permDeleteBtn);
    });

    expect(mockPermanentDelete).toHaveBeenCalledTimes(1);
    expect(mockPermanentDelete).toHaveBeenCalledWith('art-perm-del');

    // Thao tác bị khóa khi pending
    await waitFor(() => {
      expect((screen.getByRole('button', { name: /Xóa vĩnh viễn/i }) as HTMLButtonElement).disabled).toBe(true);
    });

    // Reject lỗi xóa
    await act(async () => {
      deferredPermDelete.reject(new Error('Lỗi database khi xóa vĩnh viễn'));
    });

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Lỗi database khi xóa vĩnh viễn');
    });
    expect(screen.getByText('Bài xóa vĩnh viễn')).toBeDefined();
    expect((screen.getByRole('button', { name: /Xóa vĩnh viễn/i }) as HTMLButtonElement).disabled).toBe(false);

    // 3. Retry thành công
    mockPermanentDelete.mockResolvedValueOnce({ id: 'art-perm-del' });
    mockListTrash.mockResolvedValueOnce([]);
    mockList.mockResolvedValueOnce([]);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Xóa vĩnh viễn/i }));
    });

    expect(mockPermanentDelete).toHaveBeenCalledTimes(2);
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Đã xóa vĩnh viễn nội dung!');
    });

    // Bài biến mất khỏi trash
    await waitFor(() => {
      expect(screen.getByText(/Thùng rác trống/i)).toBeDefined();
    });

    // Đóng trash và assert bài KHÔNG xuất hiện ở danh sách chính
    const closeTrashBtn = screen.getByRole('button', { name: /Đóng thùng rác/i });
    await act(async () => {
      fireEvent.click(closeTrashBtn);
    });

    expect(screen.queryByText('Bài xóa vĩnh viễn')).toBeNull();
  });

  // T05: Đóng và mở modal thùng rác bằng accessible name
  it('T05: Đóng modal bằng nút accessible aria-label="Đóng thùng rác" và mở lại không làm hỏng state', async () => {
    mockListTrash.mockResolvedValue([]);

    renderComponent();

    const openTrashBtn = screen.getByRole('button', { name: /Thùng rác/i });
    await act(async () => {
      fireEvent.click(openTrashBtn);
    });

    expect(screen.getByText(/0 nội dung đã xóa/i)).toBeDefined();

    // Bấm nút đóng modal bằng accessible name
    const closeBtn = screen.getByRole('button', { name: /Đóng thùng rác/i });
    await act(async () => {
      fireEvent.click(closeBtn);
    });

    await waitFor(() => {
      expect(screen.queryByText(/0 nội dung đã xóa/i)).toBeNull();
    });

    // Mở lại modal
    await act(async () => {
      fireEvent.click(openTrashBtn);
    });

    expect(screen.getByText(/0 nội dung đã xóa/i)).toBeDefined();
    expect(screen.getByText(/Thùng rác trống/i)).toBeDefined();
  });

  // T06: Xóa vĩnh viễn toàn bộ (Permanent delete all)
  it('T06: Xóa tất cả trong thùng rác: confirm cancel không gọi API; confirm thành công làm sạch thùng rác và gọi permanentDeleteMany', async () => {
    const item1 = createSampleContent('art-trash-1', 'Bài rác 1');
    item1.isDeleted = true;
    const item2 = createSampleContent('art-trash-2', 'Bài rác 2');
    item2.isDeleted = true;

    mockListTrash
      .mockResolvedValueOnce([item1, item2]) // Lần 1: load ban đầu
      .mockResolvedValueOnce([item1, item2]); // Lần 2: refetch sau reject (vẫn giữ các mục)

    renderComponent();

    const openTrashBtn = screen.getByRole('button', { name: /Thùng rác/i });
    await act(async () => {
      fireEvent.click(openTrashBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('Bài rác 1')).toBeDefined();
      expect(screen.getByText('Bài rác 2')).toBeDefined();
    });

    const deleteAllBtn = screen.getByRole('button', { name: /Xóa tất cả/i });

    // 1. Bấm Xóa tất cả mở ConfirmDialog -> Bấm Hủy
    await act(async () => {
      fireEvent.click(deleteAllBtn);
    });

    const cancelDialogBtn = screen.getByRole('button', { name: /Hủy/i });
    await act(async () => {
      fireEvent.click(cancelDialogBtn);
    });

    expect(mockPermanentDeleteMany).not.toHaveBeenCalled();

    // 2. Bấm Xóa tất cả -> ConfirmDialog -> Xác nhận xóa với deferred
    await act(async () => {
      fireEvent.click(deleteAllBtn);
    });

    const deferredDeleteAll = createDeferred<{ deletedCount: number }>();
    mockPermanentDeleteMany.mockReturnValueOnce(deferredDeleteAll.promise);

    // Nút xác nhận trong ConfirmDialog
    const confirmDialogBtns = screen.getAllByRole('button', { name: /Xóa tất cả/i });
    const confirmActionBtn = confirmDialogBtns[confirmDialogBtns.length - 1];

    await act(async () => {
      fireEvent.click(confirmActionBtn);
      fireEvent.click(confirmActionBtn);
    });

    expect(mockPermanentDeleteMany).toHaveBeenCalledTimes(1);
    expect(mockPermanentDeleteMany).toHaveBeenCalledWith(['art-trash-1', 'art-trash-2']);

    // Reject lỗi
    await act(async () => {
      deferredDeleteAll.reject(new Error('Lỗi khi xóa hàng loạt'));
    });

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Lỗi khi xóa hàng loạt');
    });

    // Sau reject, các mục vẫn còn trong thùng rác
    await waitFor(() => {
      expect(screen.getByText('Bài rác 1')).toBeDefined();
    });

    // Retry thành công
    mockPermanentDeleteMany.mockResolvedValueOnce({ deletedCount: 2 });
    mockListTrash.mockResolvedValueOnce([]); // Lần 3: refetch sau retry thành công

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Xóa tất cả/i }));
    });
    const confirmRetryBtns = screen.getAllByRole('button', { name: /Xóa tất cả/i });
    await act(async () => {
      fireEvent.click(confirmRetryBtns[confirmRetryBtns.length - 1]);
    });

    expect(mockPermanentDeleteMany).toHaveBeenCalledTimes(2);
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Đã xóa vĩnh viễn 2 nội dung!');
    });

    await waitFor(() => {
      expect(screen.getByText(/Thùng rác trống/i)).toBeDefined();
    });
  });
});
