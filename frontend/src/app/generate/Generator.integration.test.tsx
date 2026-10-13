// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CustomerGenerator } from './Generator';
import {
  contentService,
  type UiContent,
  type CreateContentPayload,
  type UpdateContentPayload,
  type GenerateContentPayload,
  type GenerateContentResult,
} from '@/services/contentService';

// 1. Mock TinyMCE bằng textarea đơn giản giữ nguyên contract value / onEditorChange / disabled
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

// 2. Mock next-router-compat (spy navigation, không unmount để giữ nguyên React mount session)
const mockNavigate = vi.fn<(to: string) => void>();
vi.mock('@/lib/next-router-compat', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/generate', search: '', hash: '' }),
  useParams: () => ({}),
  Link: ({ children, href, to, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { to?: string }) => (
    <a href={href || to} {...props}>
      {children}
    </a>
  ),
}));

// 3. Mock react-hot-toast với type chuẩn
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

// 4. Mock layout để không kéo theo sidebar/header ngoài phạm vi
vi.mock('@/app/components/Layout', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-layout">{children}</div>,
}));

// 5. Mock các query phụ trợ và export queryKeys tương ứng để React Query invalidation hoạt động
vi.mock('@/hooks/queries/useTemplates', () => ({
  useTemplates: () => ({ data: [], isLoading: false }),
  templateKeys: { all: ['templates'] as const },
}));
vi.mock('@/hooks/queries/useProjects', () => ({
  useProjects: () => ({ data: [], isLoading: false }),
  projectKeys: { all: ['projects'] as const },
}));
vi.mock('@/hooks/queries/useGenerateOptions', () => ({
  useGenerateOptions: () => ({ data: null, isLoading: false }),
  generateOptionKeys: { all: ['generateOptions'] as const },
}));
vi.mock('@/hooks/queries/useFineTuning', () => ({
  useFineTuningModels: () => ({ data: [], isLoading: false }),
  fineTuningKeys: { all: ['fineTuning'] as const },
}));
vi.mock('@/hooks/queries/useBilling', () => ({
  useMyBilling: () => ({ data: { plan: { allowedModels: [] } }, isLoading: false }),
  billingKeys: { all: ['billing'] as const },
}));
vi.mock('@/hooks/queries/useNotifications', () => ({
  useNotifications: () => ({ data: [], isLoading: false }),
  notificationKeys: { all: ['notifications'] as const },
}));

// 6. Mock service tại ranh giới API để useCreateContent, useUpdateContent và useGenerateContent là REAL hooks
vi.mock('@/services/contentService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/contentService')>();
  return {
    ...actual,
    contentService: {
      ...actual.contentService,
      generate: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  };
});

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

function createDummyUiContent(id: string, outputText: string, title = 'Bài viết'): UiContent {
  return {
    id,
    title,
    content: outputText,
    prompt: 'Prompt bài viết',
    type: 'headline',
    industry: 'ecommerce',
    model: 'Gemini Flash',
    quality: 90,
    words: 50,
    plagiarismScore: 0,
    originalityScore: 100,
    plagiarismRiskLevel: 'safe',
    plagiarismCheckStatus: 'completed',
    plagiarismReportId: null,
    plagiarismCheckedAt: null,
    tokens: 150,
    latency: '1.0s',
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
    versions: [{ id: 1, label: 'Phiên bản 1', quality: 90, selected: true }],
  };
}

function createGenerateResult(bundleId: string, variationsTexts: string[]): GenerateContentResult {
  const formattedVariations = variationsTexts
    .map((text, i) => `Phiên bản ${i + 1}: ${text}`)
    .join('\n\n');

  return {
    content: {
      ...createDummyUiContent(bundleId, formattedVariations, 'Bản gộp gốc AI'),
      tokens: 300,
    },
    usage: { totalTokens: 300 },
    fallback: false,
    plagiarism: null,
  };
}

describe('CustomerGenerator Component Integration Test (Batch 1.1)', () => {
  let queryClient: QueryClient;
  const mockGenerate = contentService.generate as unknown as Mock<(payload: GenerateContentPayload) => Promise<GenerateContentResult>>;
  const mockCreate = contentService.create as unknown as Mock<(payload: CreateContentPayload) => Promise<UiContent>>;
  const mockUpdate = contentService.update as unknown as Mock<(id: string, payload: UpdateContentPayload) => Promise<UiContent>>;

  beforeEach(() => {
    vi.resetAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Default: generate trả 3 phiên bản rõ ràng
    mockGenerate.mockResolvedValue(
      createGenerateResult('bundle-ai-origin-001', [
        '<p>Nội dung <strong>phiên bản 1</strong> ban đầu</p>',
        '<p>Nội dung <em>phiên bản 2</em> ban đầu</p>',
        '<p>Nội dung phiên bản 3 ban đầu</p>',
      ])
    );

    mockCreate.mockImplementation(async (payload: CreateContentPayload) => {
      return createDummyUiContent('article-created-default', payload.outputText, payload.title);
    });

    mockUpdate.mockImplementation(async (id: string, payload: UpdateContentPayload) => {
      return createDummyUiContent(id, payload.outputText || '', payload.title || 'Bài viết');
    });
  });

  afterEach(() => {
    cleanup();
    queryClient.clear();
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <CustomerGenerator />
      </QueryClientProvider>
    );

  // C01: Mapping qua nhiều phiên bản trong cùng một component mount
  it('C01: Mapping qua nhiều phiên bản trong cùng một mount session (Create A -> Create B -> Update A)', async () => {
    mockCreate
      .mockResolvedValueOnce(createDummyUiContent('article-v2-A', '<p>Bản 2 đã sửa lần 1</p>'))
      .mockResolvedValueOnce(createDummyUiContent('article-v1-B', '<p>Bản 1 đã sửa lần 1</p>'));

    mockUpdate.mockResolvedValue(createDummyUiContent('article-v2-A', '<p>Bản 2 sửa lần 2</p>'));

    renderComponent();

    // 1. Generate 3 phiên bản
    const generateBtn = screen.getByRole('button', { name: /Tạo 3 phiên bản/i });
    await act(async () => {
      fireEvent.click(generateBtn);
    });

    await waitFor(() => screen.getByRole('button', { name: /^Lưu$/i }));
    mockToastSuccess.mockClear();

    // 2. Chọn phiên bản 2, sửa và lưu lần đầu
    const tabV2 = screen.getByRole('button', { name: /Phiên bản 2/i });
    await act(async () => {
      fireEvent.click(tabV2);
    });

    const editBtn = screen.getByRole('button', { name: /Chỉnh sửa/i });
    await act(async () => {
      fireEvent.click(editBtn);
    });

    const editorV2 = screen.getByTestId('mock-tinymce-editor') as HTMLTextAreaElement;
    await act(async () => {
      fireEvent.change(editorV2, { target: { value: '<p>Bản 2 đã sửa lần 1</p>' } });
    });

    const saveBtn = screen.getByRole('button', { name: /^Lưu$/i });
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    // 3. Assert create bài riêng A, không update bản gộp
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockCreate.mock.calls[0][0].outputText).toBe('<p>Bản 2 đã sửa lần 1</p>');
    expect(mockNavigate).toHaveBeenCalledWith('/contents/article-v2-A');
    expect(mockToastSuccess).toHaveBeenCalledWith('Nội dung đã được lưu vào DB!');

    mockCreate.mockClear();
    mockToastSuccess.mockClear();
    mockNavigate.mockClear();

    // 4. Chọn phiên bản 1, sửa và lưu lần đầu
    const tabV1 = screen.getByRole('button', { name: /Phiên bản 1/i });
    await act(async () => {
      fireEvent.click(tabV1);
    });

    await act(async () => {
      fireEvent.click(editBtn);
    });

    // Re-query editor textarea sau khi đổi tab
    const editorV1 = screen.getByTestId('mock-tinymce-editor') as HTMLTextAreaElement;
    await act(async () => {
      fireEvent.change(editorV1, { target: { value: '<p>Bản 1 đã sửa lần 1</p>' } });
    });

    const currentSaveBtn1 = screen.getByRole('button', { name: /^Lưu$/i });
    await act(async () => {
      fireEvent.click(currentSaveBtn1);
    });

    // 5. Assert create bài riêng B khác A, không update A hoặc bản gộp
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockCreate.mock.calls[0][0].outputText).toBe('<p>Bản 1 đã sửa lần 1</p>');
    expect(mockNavigate).toHaveBeenCalledWith('/contents/article-v1-B');

    mockCreate.mockClear();
    mockToastSuccess.mockClear();
    mockNavigate.mockClear();

    // 6. Quay lại phiên bản 2, sửa và lưu tiếp
    await act(async () => {
      fireEvent.click(tabV2);
    });

    await act(async () => {
      fireEvent.click(editBtn);
    });

    const editorV2Second = screen.getByTestId('mock-tinymce-editor') as HTMLTextAreaElement;
    await act(async () => {
      fireEvent.change(editorV2Second, { target: { value: '<p>Bản 2 sửa lần 2</p>' } });
    });

    const currentSaveBtn2 = screen.getByRole('button', { name: /^Lưu$/i });
    await act(async () => {
      fireEvent.click(currentSaveBtn2);
    });

    // 7. Assert update A với đúng HTML, không create thêm, không update B hoặc bản gộp
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalledWith('article-v2-A', expect.objectContaining({
      outputText: '<p>Bản 2 sửa lần 2</p>',
    }));
    expect(mockNavigate).toHaveBeenCalledWith('/contents/article-v2-A');
    expect(mockToastSuccess).toHaveBeenCalledWith('Đã lưu chỉnh sửa vào DB!');
  });

  // C02 — Generate thành công lượt mới
  it('C02: Generate lượt mới thành công sẽ reset mapping, phiên bản cùng số thứ tự được tạo bài riêng mới', async () => {
    mockCreate
      .mockResolvedValueOnce(createDummyUiContent('article-session1-v2', '<p>Bản 2 lượt 1</p>'))
      .mockResolvedValueOnce(createDummyUiContent('article-session2-v2', '<p>Bản 2 lượt 2</p>'));

    renderComponent();

    // Lượt 1: generate và lưu phiên bản 2
    const generateBtn = screen.getByRole('button', { name: /Tạo 3 phiên bản/i });
    await act(async () => {
      fireEvent.click(generateBtn);
    });

    await waitFor(() => screen.getByRole('button', { name: /^Lưu$/i }));

    const tabV2 = screen.getByRole('button', { name: /Phiên bản 2/i });
    await act(async () => {
      fireEvent.click(tabV2);
    });

    const saveBtnL1 = screen.getByRole('button', { name: /^Lưu$/i });
    await act(async () => {
      fireEvent.click(saveBtnL1);
    });

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/contents/article-session1-v2');

    mockCreate.mockClear();
    mockNavigate.mockClear();

    // Lượt 2: Generate mới thành công (trả bundle mới)
    mockGenerate.mockResolvedValueOnce(
      createGenerateResult('bundle-ai-origin-002', [
        '<p>Lượt 2 - Bản 1</p>',
        '<p>Lượt 2 - Bản 2</p>',
        '<p>Lượt 2 - Bản 3</p>',
      ])
    );

    await act(async () => {
      fireEvent.click(generateBtn);
    });

    await waitFor(() => screen.getByRole('button', { name: /^Lưu$/i }));

    // Chọn lại phiên bản 2 ở lượt 2 và lưu
    const tabV2L2 = screen.getByRole('button', { name: /Phiên bản 2/i });
    await act(async () => {
      fireEvent.click(tabV2L2);
    });

    const saveBtnL2 = screen.getByRole('button', { name: /^Lưu$/i });
    await act(async () => {
      fireEvent.click(saveBtnL2);
    });

    // Assert: Vì lượt mới đã reset mapping nên gọi CREATE mới, KHÔNG update article-session1-v2
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/contents/article-session2-v2');
  });

  // C03 — Generate thất bại giữ nguyên kết quả cũ và mapping
  it('C03: Generate thất bại giữ nguyên kết quả cũ và mapping của bài riêng đã lưu', async () => {
    mockCreate.mockResolvedValueOnce(createDummyUiContent('article-v2-keep', '<p>Bản 2</p>'));
    mockUpdate.mockResolvedValue(createDummyUiContent('article-v2-keep', '<p>Bản 2 sửa tiếp</p>'));

    renderComponent();

    // 1. Generate lượt 1 và lưu bài riêng A cho phiên bản 2
    const generateBtn = screen.getByRole('button', { name: /Tạo 3 phiên bản/i });
    await act(async () => {
      fireEvent.click(generateBtn);
    });

    await waitFor(() => screen.getByRole('button', { name: /^Lưu$/i }));

    const tabV2 = screen.getByRole('button', { name: /Phiên bản 2/i });
    await act(async () => {
      fireEvent.click(tabV2);
    });

    const saveBtnL1 = screen.getByRole('button', { name: /^Lưu$/i });
    await act(async () => {
      fireEvent.click(saveBtnL1);
    });

    expect(mockCreate).toHaveBeenCalledTimes(1);
    mockCreate.mockClear();
    mockNavigate.mockClear();

    // 2. Chỉnh sửa nội dung đang hiển thị
    const editBtn = screen.getByRole('button', { name: /Chỉnh sửa/i });
    await act(async () => {
      fireEvent.click(editBtn);
    });

    const editor = screen.getByTestId('mock-tinymce-editor') as HTMLTextAreaElement;
    await act(async () => {
      fireEvent.change(editor, { target: { value: '<p>Bản 2 sửa tiếp sau khi lưu</p>' } });
    });

    // 3. Generate tiếp nhưng reject do lỗi mạng
    mockGenerate.mockRejectedValueOnce(new Error('AI Gateway Service Unavailable'));

    await act(async () => {
      fireEvent.click(generateBtn);
    });

    // 4. Assert: Báo lỗi generate nhưng kết quả và editor vẫn còn nguyên
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('AI Gateway Service Unavailable');
    });

    expect(editor.value).toBe('<p>Bản 2 sửa tiếp sau khi lưu</p>');

    // 5. Lưu lại phiên bản cũ
    const saveBtnRetry = screen.getByRole('button', { name: /^Lưu$/i });
    await act(async () => {
      fireEvent.click(saveBtnRetry);
    });

    // 6. Assert: Vẫn nhớ mapping cũ -> gọi UPDATE lên bài A, không create mới
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalledWith('article-v2-keep', expect.objectContaining({
      outputText: '<p>Bản 2 sửa tiếp sau khi lưu</p>',
    }));
    expect(mockNavigate).toHaveBeenCalledWith('/contents/article-v2-keep');
  });

  // C04 — Create pending và update pending kiểm tra 5 điều khiển bị khóa
  it('C04: Create pending và Update pending khóa chính xác cả 5 điều khiển trên DOM và không navigate trước khi settle', async () => {
    const deferredCreate = createDeferred<UiContent>();
    mockCreate.mockReturnValue(deferredCreate.promise);

    renderComponent();

    // Generate
    const mainGenerateBtn = screen.getByRole('button', { name: /Tạo 3 phiên bản/i }) as HTMLButtonElement;
    await act(async () => {
      fireEvent.click(mainGenerateBtn);
    });

    await waitFor(() => screen.getByRole('button', { name: /^Lưu$/i }));
    mockToastSuccess.mockClear();

    // Chuyển sang edit mode
    const editBtn = screen.getByRole('button', { name: /Chỉnh sửa/i });
    await act(async () => {
      fireEvent.click(editBtn);
    });

    const editor = screen.getByTestId('mock-tinymce-editor') as HTMLTextAreaElement;
    const saveBtn = screen.getByRole('button', { name: /^Lưu$/i }) as HTMLButtonElement;
    const tabV1 = screen.getByRole('button', { name: /Phiên bản 1/i }) as HTMLButtonElement;
    const regenerateBtn = screen.getByRole('button', { name: /Tạo lại/i }) as HTMLButtonElement;

    // --- NHÁNH 1: CREATE PENDING ---
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    // Kiểm tra chính xác 5 điều khiển bị disable trên DOM trong lúc pending:
    await waitFor(() => {
      expect(saveBtn.disabled).toBe(true);
    });
    expect(editor.disabled).toBe(true);
    expect(tabV1.disabled).toBe(true);
    expect(regenerateBtn.disabled).toBe(true);
    expect(mainGenerateBtn.disabled).toBe(true);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();

    // Resolve create
    await act(async () => {
      deferredCreate.resolve(createDummyUiContent('article-resolved-c04', '<p>Nội dung</p>'));
    });

    // Sau khi resolve: các điều khiển được mở lại và navigate đúng ID bài riêng
    await waitFor(() => {
      expect(saveBtn.disabled).toBe(false);
    });
    expect(editor.disabled).toBe(false);
    expect(tabV1.disabled).toBe(false);
    expect(regenerateBtn.disabled).toBe(false);
    expect(mainGenerateBtn.disabled).toBe(false);
    expect(mockNavigate).toHaveBeenCalledWith('/contents/article-resolved-c04');
    expect(mockToastSuccess).toHaveBeenCalledWith('Nội dung đã được lưu vào DB!');

    mockNavigate.mockClear();
    mockToastSuccess.mockClear();

    // --- NHÁNH 2: UPDATE PENDING ---
    const deferredUpdate = createDeferred<UiContent>();
    mockUpdate.mockReturnValue(deferredUpdate.promise);

    await act(async () => {
      fireEvent.change(editor, { target: { value: '<p>Nội dung đã sửa lần 2</p>' } });
    });

    await act(async () => {
      fireEvent.click(saveBtn);
    });

    // Kiểm tra 5 điều khiển bị disable trên DOM trong lúc update pending:
    await waitFor(() => {
      expect(saveBtn.disabled).toBe(true);
    });
    expect(editor.disabled).toBe(true);
    expect(tabV1.disabled).toBe(true);
    expect(regenerateBtn.disabled).toBe(true);
    expect(mainGenerateBtn.disabled).toBe(true);
    expect(mockNavigate).not.toHaveBeenCalled();

    // Resolve update
    await act(async () => {
      deferredUpdate.resolve(createDummyUiContent('article-resolved-c04', '<p>Nội dung đã sửa lần 2</p>'));
    });

    await waitFor(() => {
      expect(saveBtn.disabled).toBe(false);
    });
    expect(editor.disabled).toBe(false);
    expect(tabV1.disabled).toBe(false);
    expect(regenerateBtn.disabled).toBe(false);
    expect(mainGenerateBtn.disabled).toBe(false);
    expect(mockNavigate).toHaveBeenCalledWith('/contents/article-resolved-c04');
    expect(mockToastSuccess).toHaveBeenCalledWith('Đã lưu chỉnh sửa vào DB!');
  });

  // C05 — Create reject rồi retry
  it('C05: Click Save liên tiếp khi create pending chỉ tạo 1 request; khi reject giải phóng guard và retry thành công', async () => {
    const deferredCreate1 = createDeferred<UiContent>();
    mockCreate.mockReturnValueOnce(deferredCreate1.promise);

    renderComponent();

    const generateBtn = screen.getByRole('button', { name: /Tạo 3 phiên bản/i });
    await act(async () => {
      fireEvent.click(generateBtn);
    });

    await waitFor(() => screen.getByRole('button', { name: /^Lưu$/i }));
    mockToastSuccess.mockClear();
    mockNavigate.mockClear();

    const editBtn = screen.getByRole('button', { name: /Chỉnh sửa/i });
    await act(async () => {
      fireEvent.click(editBtn);
    });

    const editor = screen.getByTestId('mock-tinymce-editor') as HTMLTextAreaElement;
    await act(async () => {
      fireEvent.change(editor, { target: { value: '<p>Nội dung quan trọng</p>' } });
    });

    const saveBtn = screen.getByRole('button', { name: /^Lưu$/i }) as HTMLButtonElement;

    // 1. Kích hoạt Save hai lần liên tiếp khi request còn in-flight
    await act(async () => {
      fireEvent.click(saveBtn);
      fireEvent.click(saveBtn);
    });

    // 2. Assert: Synchronous guard chặn đứng click thứ 2, chỉ tạo 1 request
    expect(mockCreate).toHaveBeenCalledTimes(1);

    // 3. Reject request đầu tiên
    await act(async () => {
      deferredCreate1.reject(new Error('Lỗi timeout DB'));
    });

    // 4. Assert: toast error, không success, không navigate, editor còn nguyên
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Lỗi timeout DB');
    });
    expect(mockToastSuccess).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(editor.value).toBe('<p>Nội dung quan trọng</p>');

    // 5. Assert: Điều khiển được mở lại sau reject (guard giải phóng)
    expect(saveBtn.disabled).toBe(false);

    // 6. Retry: Người dùng bấm Lưu lại
    mockCreate.mockResolvedValueOnce(createDummyUiContent('article-retry-success', '<p>Nội dung quan trọng</p>'));

    await act(async () => {
      fireEvent.click(saveBtn);
    });

    // 7. Assert: Create được gọi lần thứ 2 và thành công
    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(mockToastSuccess).toHaveBeenCalledWith('Nội dung đã được lưu vào DB!');
    expect(mockNavigate).toHaveBeenCalledWith('/contents/article-retry-success');

    mockCreate.mockClear();
    mockToastSuccess.mockClear();
    mockNavigate.mockClear();

    // 8. Lưu tiếp cùng phiên bản phải gọi UPDATE lên ID vừa tạo
    await act(async () => {
      fireEvent.change(editor, { target: { value: '<p>Nội dung quan trọng sửa tiếp</p>' } });
    });

    await act(async () => {
      fireEvent.click(saveBtn);
    });

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalledWith('article-retry-success', expect.objectContaining({
      outputText: '<p>Nội dung quan trọng sửa tiếp</p>',
    }));
  });

  // C06 — Update reject rồi retry
  it('C06: Update reject giữ nguyên ID bài riêng, giải phóng guard và retry update thành công', async () => {
    mockCreate.mockResolvedValueOnce(createDummyUiContent('article-update-retry', '<p>Nội dung gốc</p>'));

    renderComponent();

    // Generate và lưu lần đầu thành công
    const generateBtn = screen.getByRole('button', { name: /Tạo 3 phiên bản/i });
    await act(async () => {
      fireEvent.click(generateBtn);
    });

    await waitFor(() => screen.getByRole('button', { name: /^Lưu$/i }));

    const saveBtn = screen.getByRole('button', { name: /^Lưu$/i }) as HTMLButtonElement;
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledWith('Nội dung đã được lưu vào DB!');
    mockCreate.mockClear();
    mockNavigate.mockClear();
    mockToastSuccess.mockClear();

    // Sửa nội dung
    const editBtn = screen.getByRole('button', { name: /Chỉnh sửa/i });
    await act(async () => {
      fireEvent.click(editBtn);
    });

    const editor = screen.getByTestId('mock-tinymce-editor') as HTMLTextAreaElement;
    await act(async () => {
      fireEvent.change(editor, { target: { value: '<p>Nội dung sửa lần 2</p>' } });
    });

    // Update lần đầu bị reject
    mockUpdate.mockRejectedValueOnce(new Error('Network drop khi update'));

    await act(async () => {
      fireEvent.click(saveBtn);
    });

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Network drop khi update');
    });
    expect(mockToastSuccess).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(editor.value).toBe('<p>Nội dung sửa lần 2</p>');
    expect(saveBtn.disabled).toBe(false);

    // Retry update thành công
    mockUpdate.mockResolvedValueOnce(createDummyUiContent('article-update-retry', '<p>Nội dung sửa lần 2</p>'));

    await act(async () => {
      fireEvent.click(saveBtn);
    });

    // Assert: Retry đúng ID article-update-retry, không create thêm
    expect(mockUpdate).toHaveBeenCalledTimes(2);
    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenLastCalledWith('article-update-retry', expect.objectContaining({
      outputText: '<p>Nội dung sửa lần 2</p>',
    }));
    expect(mockToastSuccess).toHaveBeenCalledWith('Đã lưu chỉnh sửa vào DB!');
    expect(mockNavigate).toHaveBeenCalledWith('/contents/article-update-retry');
  });

  // C07 — Nội dung rỗng và response ID không hợp lệ
  it('C07: Nội dung rỗng không gọi mutation, giải phóng guard; response ID không hợp lệ không fallback sang bản gộp', async () => {
    renderComponent();

    // Generate
    const generateBtn = screen.getByRole('button', { name: /Tạo 3 phiên bản/i });
    await act(async () => {
      fireEvent.click(generateBtn);
    });

    await waitFor(() => screen.getByRole('button', { name: /^Lưu$/i }));
    mockToastSuccess.mockClear();
    mockNavigate.mockClear();

    const editBtn = screen.getByRole('button', { name: /Chỉnh sửa/i });
    await act(async () => {
      fireEvent.click(editBtn);
    });

    const editor = screen.getByTestId('mock-tinymce-editor') as HTMLTextAreaElement;
    const saveBtn = screen.getByRole('button', { name: /^Lưu$/i });

    // 1. Nội dung rỗng
    await act(async () => {
      fireEvent.change(editor, { target: { value: '<p>   <br/>  </p>' } });
    });

    await act(async () => {
      fireEvent.click(saveBtn);
    });

    expect(mockToastError).toHaveBeenCalledWith('Không có nội dung để lưu');
    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    mockToastError.mockClear();

    // 2. Nhập nội dung hợp lệ: Guard không bị kẹt sau lỗi validation
    await act(async () => {
      fireEvent.change(editor, { target: { value: '<p>Nội dung hợp lệ</p>' } });
    });

    // Mô phỏng response không hợp lệ (ID rỗng)
    mockCreate.mockResolvedValueOnce(createDummyUiContent('', '<p>Nội dung hợp lệ</p>'));

    await act(async () => {
      fireEvent.click(saveBtn);
    });

    // 3. Response thiếu ID: Ném lỗi, không navigate, không success và TUYỆT ĐỐI không fallback sang bundle ID
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Response không có ID bài viết hợp lệ');
    });
    expect(mockToastSuccess).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalledWith(expect.stringContaining('bundle-ai-origin-001'));
  });
});
