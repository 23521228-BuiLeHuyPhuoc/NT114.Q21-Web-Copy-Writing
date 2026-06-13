# Task Tracker - Hoan Thien NT114

Ngay cap nhat: 12/06/2026

Muc tieu: hoan thien README, chay integration test, go mock service con sot, dong goi Docker, chuan bi demo do an NT114 va co quality gate cuoi de tranh con mock/flow loi truoc khi nop.

## Tong Quan Tien Do

| Phase | Noi dung | Uoc tinh | Trang thai |
| --- | --- | ---: | --- |
| Phase 0 | Cap nhat README | ~2h | Chua lam |
| Phase 1 | Chay + test integration | ~3-4h | Chua lam |
| Phase 2 | Fix mock services + bugs | ~2-3h | Chua lam |
| Phase 3 | Docker + deploy | ~3-4h | Chua lam |
| Phase 4 | Chuan bi demo | ~2-3h | Chua lam |
| Phase 5 | Quality gate + ban giao | ~1-2h | Chua lam |

## Ra Soat Bo Sung 12/06

Nhung diem da phat hien can dua vao ke hoach:

- `README.md` van con mo ta service layer dung mock/API, thu muc `mocks`, auth mock bang `localStorage` va cac viec tuong lai ve thay mock service.
- `docker-compose.yml` o root dang rong, can viet that su truoc khi test Docker Compose.
- Backend con provider/default `mock` trong `FineTuneJob`, `Payment`, `Subscription`, `billingService` va `seed.js`.
- Frontend con service tra mock nhu du lieu that: `paymentService.ts`, `apiKeyService.ts`, `historyService.ts`.
- Frontend con mot so mock dang dung nhu option/static dictionary. Can phan loai ro: cai nao duoc phep giu, cai nao la fake API data phai bo.
- Fine-tuning hien nen chi giu provider that co the tao job: `vertex-gemini`, `vertex-llama`, `vertex-qwen`; khong hien Hugging Face nhu provider fine-tuning doc lap.
- Qwen 3 0.6B dung Vertex Model Garden flow hien tai; can xac minh app submit dung API ma Google Console dung.
- Fine-tune import da co CSV/Excel, can them test chat luong dataset: output phai la copy sinh ra, khong duoc trung prompt hay meta instruction.
- Billing/pricing con noi dung demo/fallback, can canh lai de khong overclaim production payment neu gateway chua cau hinh.

## Phase 0 - Cap Nhat README (~2h)

- [ ] Sua Muc 1: Bang Cong nghe
- [ ] Sua Muc 2.3: Cau truc Backend
- [ ] Sua Muc 2.4: Database Models
- [ ] Sua Muc 5: Huong tiep can AI
- [ ] Sua Muc 6: Module 6 Thanh Toan
- [ ] Sua Muc 8: Tien do, cap nhat ngay 12/06
- [ ] Go cac dong README cu ve mock/API service layer, thu muc mock va auth mock/localStorage neu khong con dung.
- [ ] Cap nhat danh sach fine-tuning provider that: `vertex-gemini`, `vertex-llama`, `vertex-qwen`.
- [ ] Ghi ro khong con Hugging Face provider doc lap; Qwen 3 0.6B can chay qua dung Vertex Model Garden tuning flow.
- [ ] Cap nhat import dataset fine-tuning ho tro CSV va Excel `.xlsx/.xls`.
- [ ] Ghi ro dieu kien dung fine-tuned model trong AI Generator: provider phai co endpoint inference that; Qwen tuned output can deploy endpoint rieng neu muon generate.
- [ ] Cap nhat phan Docker theo `backend/Dockerfile`, `frontend/Dockerfile` va `docker-compose.yml` sau Phase 3.

Ket qua can dat:
- README phan anh dung cong nghe hien tai cua project.
- Backend structure va database models khop voi code thuc te.
- Phan AI neu ro provider, fine-tuning, plagiarism check va cac gioi han hien co.
- Phan thanh toan khong mo ta mock nhu tinh nang san sang production.
- Khong con noi dung README lam nguoi doc hieu rang app van chay bang mock trong cac flow chinh.

## Phase 1 - Chay + Test Integration (~3-4h)

- [ ] Kiem tra MongoDB
- [ ] Chuan bi `.env` backend
- [ ] Seed data
- [ ] Test Auth flow
- [ ] Test forgot/reset password neu demo co dung email/OTP
- [ ] Test Content CRUD
- [ ] Test AI Generate
- [ ] Test Fine-tune import CSV
- [ ] Test Fine-tune import Excel `.xlsx/.xls`
- [ ] Test tao fine-tune job voi provider kha dung (`vertex-gemini`, `vertex-llama`, `vertex-qwen`) theo env hien co
- [ ] Test promote/active fine-tuned model va mo sang `/generate?model=fine-tuned:*`
- [ ] Test Generator khi chon model fine-tuned: thanh cong neu co endpoint, bao loi ro neu chua co endpoint inference
- [ ] Test Plagiarism Check voi SerpApi/Common Crawl khi co key va graceful error khi thieu key
- [ ] Test Admin flow
- [ ] Test Billing/Pricing/Payment flow voi provider thanh toan da cau hinh
- [ ] Test notification, profile va route guard customer/admin

Ket qua can dat:
- Backend ket noi MongoDB on dinh.
- Data seed du cho demo customer/admin.
- Cac flow chinh chay duoc tu frontend toi backend.
- Ghi lai bug phat sinh de dua sang Phase 2.
- Fine-tuning khong chi import duoc file ma con tao job dung provider that, validate loi ro khi thieu credential.

## Phase 2 - Fix Mock Services + Bugs (~2-3h)

- [ ] Fix `paymentService.ts`: bo mock fallback
- [ ] Fix hoac bo `apiKeyService.ts`
- [ ] Fix hoac bo `historyService.ts`
- [ ] Fix route rong `/admin/register`
- [ ] Fix `frontend/src/app/billing/Billing.tsx`: bo fallback demo neu backend billing loi, hien loi that de debug.
- [ ] Fix backend `FineTuneJob.provider`: bo default `mock`, chuyen sang provider that hoac bat buoc nhap provider.
- [ ] Fix backend `Payment.provider` va `Subscription.provider`: bo default `mock`, dung `manual` hoac gateway that theo thiet ke.
- [ ] Fix `billingService.js`: bo cac response/gateway `mock`, thay bang manual/sandbox gateway ro rang.
- [ ] Fix `seed.js`: seed payment/subscription khong dung provider `mock` neu muon demo billing that.
- [ ] Ra soat `frontend/src/mocks/*`: tach static option dictionary duoc phep giu khoi fake API data phai bo.
- [ ] Xoa hoac archive cac goi/file Hugging Face standalone cu neu khong con dung trong flow fine-tuning.
- [ ] Kiem tra cac trang `_unrouted`: bo import mock neu co kha nang bi dung trong demo hoac README.
- [ ] Kiem tra cac text UI dang ghi `MVP demo`, `backend chua san sang`, `provider chua ho tro` de dam bao thong diep dung voi hien trang.
- [ ] Fix bugs phat hien tu Phase 1

Ket qua can dat:
- Frontend khong con hien du lieu mock nhu du lieu that o cac module quan trong.
- Cac service can backend that thi goi API that va xu ly loi ro rang.
- Route rong hoac man hinh chua hoan thien khong lam demo bi dut flow.
- Backend khong tao data moi voi provider `mock` trong fine-tune/payment/subscription.

## Phase 3 - Docker + Deploy (~3-4h)

- [ ] Tao/cap nhat Backend `Dockerfile`
- [ ] Tao/cap nhat Frontend `Dockerfile`
- [ ] Hoan thien `docker-compose.yml`
- [ ] Them service MongoDB vao Compose, volume persist data va healthcheck co ban
- [ ] Truyen env cho backend/frontend: MongoDB, JWT, AI providers, payment gateways, frontend API base URL
- [ ] Dam bao `docker-compose.yml` root khong con rong va build duoc tu repo sach
- [ ] Kiem tra `.dockerignore` cho backend/frontend de khong copy `node_modules`, file zip/cache khong can thiet
- [ ] Chay seed trong container hoac ghi lenh seed ro trong README
- [ ] Test `docker-compose up`

Ket qua can dat:
- Backend, frontend va MongoDB co the chay bang Docker Compose.
- Bien moi truong duoc tach ro cho local/demo.
- Docker build khong phu thuoc file tam hoac cau hinh may ca nhan.
- Compose co the dung de demo lai tren may khac ma khong can setup tay qua nhieu buoc.

## Phase 4 - Chuan Bi Demo (~2-3h)

- [ ] Bo sung seed data
- [ ] Fix UI cho demo
- [ ] Tao kich ban demo
- [ ] Tao/kiem tra tai khoan demo customer va admin, kem role/permission dung.
- [ ] Chuan bi dataset fine-tuning Excel mau: output la copy marketing dac sac, khong trung prompt, khong la meta instruction.
- [ ] Demo flow fine-tuning: import Excel, chon provider that, tao job, xem status/metrics, promote model.
- [ ] Demo flow generate voi model base va fine-tuned; neu Qwen tuned output chua co inference endpoint thi noi ro phan training adapter va cach deploy endpoint.
- [ ] Demo flow plagiarism check voi noi dung co/khong co trung lap.
- [ ] Demo flow admin: user approval, model/provider management, audit/payment logs neu da ket noi API that.
- [ ] Demo flow billing: xem goi, tao thanh toan manual/sandbox gateway, admin xem giao dich.
- [ ] Chuan bi script demo theo thu tu 8-10 phut va danh sach credential/env can bat truoc khi demo.

Ket qua can dat:
- Co tai khoan demo, du lieu mau va noi dung mau de thao tac lien tuc.
- UI cac man hinh demo khong bi trong, loi font, loi layout hoac hien mock vo ly.
- Kich ban demo co thu tu ro: dang nhap, tao content, fine-tuning/import file, plagiarism/admin/billing neu can.
- Demo the hien diem khac biet cua fine-tuning: output theo brand voice ro hon model goc.

## Phase 5 - Quality Gate + Ban Giao (~1-2h)

- [ ] Chay backend syntax check hoac start smoke: `node src/server.js`/`npm start` voi env demo.
- [ ] Chay frontend build: `npm run build` trong `frontend`.
- [ ] Chay smoke test API: health/auth/content/generate/fine-tune/plagiarism/billing/admin.
- [ ] Chay check import dataset fine-tuning: CSV va Excel parse dung so dong, output khac prompt, output du dai, khong chua meta instruction.
- [ ] Chay `rg` de dam bao active services khong con `MOCK_*` hoac fallback mock trong payment/API key/history/fine-tune.
- [ ] Chay `docker compose config` va `docker compose up --build` toi khi backend/frontend/MongoDB healthy.
- [ ] Cap nhat README lan cuoi theo ket qua test that, gom command chay local va Docker.
- [ ] Ghi lai cac gioi han con lai: API key nao bat buoc, gateway nao sandbox, provider fine-tune nao can credential/GPU.
- [ ] Kiem tra artifact nop bai: bo file tam/cache/log/zip cu neu khong can, giu lai dataset demo va tai lieu can thiet.

Ket qua can dat:
- Co bang chung build/smoke test truoc demo.
- README va tracker khop voi code da chay that.
- Khong con mock/fallback gia trong cac flow chinh.
- Nguoi khac clone repo co the chay theo README ma khong phai doan cau hinh.

## Ghi Chu Thuc Thi

- Uu tien lam Phase 0 truoc de README khop voi hien trang code.
- Phase 1 phai ghi bug cu the theo module, route, input va ket qua mong doi.
- Phase 2 chi fix cac mock/bug anh huong demo va tinh dung cua do an, tranh refactor lon.
- Phase 3 nen chay tren moi truong sach sau khi backend/frontend da qua test local.
- Phase 4 nen chot bang mot lan rehearsal demo day du tu dau den cuoi.
- Phase 5 la cua chan cuoi: khong nop khi build fail, Compose chua chay, hoac active flow van tra mock nhu du lieu that.
