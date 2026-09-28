---
title: "Fixture: bài chưa được duyệt"
date: 2026-09-28
summary: "Fixture kiểm tra cổng duyệt. Không bao giờ đặt approved: true cho tệp này."
category: su-kien
lang: vi
approved: false
source: n8n
---

UNAPPROVED_FIXTURE_MARKER_DO_NOT_PUBLISH

Tệp này tồn tại để chứng minh nội dung chưa duyệt không xuất hiện trong bản build.
`scripts/verify-approval.mjs` sẽ làm build thất bại nếu chuỗi marker ở trên lọt vào `dist/`.
