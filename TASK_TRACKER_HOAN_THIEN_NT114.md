# Task Tracker - Hoan Thien NT114

Ngay cap nhat: 12/06/2026

Muc tieu: hoan thien README, chay integration test, go mock service con sot, dong goi Docker va chuan bi demo do an NT114.

## Tong Quan Tien Do

| Phase | Noi dung | Uoc tinh | Trang thai |
| --- | --- | ---: | --- |
| Phase 0 | Cap nhat README | ~2h | Chua lam |
| Phase 1 | Chay + test integration | ~3-4h | Chua lam |
| Phase 2 | Fix mock services + bugs | ~2-3h | Chua lam |
| Phase 3 | Docker + deploy | ~3-4h | Chua lam |
| Phase 4 | Chuan bi demo | ~2-3h | Chua lam |

## Phase 0 - Cap Nhat README (~2h)

- [ ] Sua Muc 1: Bang Cong nghe
- [ ] Sua Muc 2.3: Cau truc Backend
- [ ] Sua Muc 2.4: Database Models
- [ ] Sua Muc 5: Huong tiep can AI
- [ ] Sua Muc 6: Module 6 Thanh Toan
- [ ] Sua Muc 8: Tien do, cap nhat ngay 12/06

Ket qua can dat:
- README phan anh dung cong nghe hien tai cua project.
- Backend structure va database models khop voi code thuc te.
- Phan AI neu ro provider, fine-tuning, plagiarism check va cac gioi han hien co.
- Phan thanh toan khong mo ta mock nhu tinh nang san sang production.

## Phase 1 - Chay + Test Integration (~3-4h)

- [ ] Kiem tra MongoDB
- [ ] Chuan bi `.env` backend
- [ ] Seed data
- [ ] Test Auth flow
- [ ] Test Content CRUD
- [ ] Test AI Generate
- [ ] Test Admin flow

Ket qua can dat:
- Backend ket noi MongoDB on dinh.
- Data seed du cho demo customer/admin.
- Cac flow chinh chay duoc tu frontend toi backend.
- Ghi lai bug phat sinh de dua sang Phase 2.

## Phase 2 - Fix Mock Services + Bugs (~2-3h)

- [ ] Fix `paymentService.ts`: bo mock fallback
- [ ] Fix hoac bo `apiKeyService.ts`
- [ ] Fix hoac bo `historyService.ts`
- [ ] Fix route rong `/admin/register`
- [ ] Fix bugs phat hien tu Phase 1

Ket qua can dat:
- Frontend khong con hien du lieu mock nhu du lieu that o cac module quan trong.
- Cac service can backend that thi goi API that va xu ly loi ro rang.
- Route rong hoac man hinh chua hoan thien khong lam demo bi dut flow.

## Phase 3 - Docker + Deploy (~3-4h)

- [ ] Tao/cap nhat Backend `Dockerfile`
- [ ] Tao/cap nhat Frontend `Dockerfile`
- [ ] Hoan thien `docker-compose.yml`
- [ ] Test `docker-compose up`

Ket qua can dat:
- Backend, frontend va MongoDB co the chay bang Docker Compose.
- Bien moi truong duoc tach ro cho local/demo.
- Docker build khong phu thuoc file tam hoac cau hinh may ca nhan.

## Phase 4 - Chuan Bi Demo (~2-3h)

- [ ] Bo sung seed data
- [ ] Fix UI cho demo
- [ ] Tao kich ban demo

Ket qua can dat:
- Co tai khoan demo, du lieu mau va noi dung mau de thao tac lien tuc.
- UI cac man hinh demo khong bi trong, loi font, loi layout hoac hien mock vo ly.
- Kich ban demo co thu tu ro: dang nhap, tao content, fine-tuning/import file, plagiarism/admin/billing neu can.

## Ghi Chu Thuc Thi

- Uu tien lam Phase 0 truoc de README khop voi hien trang code.
- Phase 1 phai ghi bug cu the theo module, route, input va ket qua mong doi.
- Phase 2 chi fix cac mock/bug anh huong demo va tinh dung cua do an, tranh refactor lon.
- Phase 3 nen chay tren moi truong sach sau khi backend/frontend da qua test local.
- Phase 4 nen chot bang mot lan rehearsal demo day du tu dau den cuoi.

