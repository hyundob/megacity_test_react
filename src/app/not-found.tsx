import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-5 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-500">
          404
        </p>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          요청한 주소가 변경되었거나 존재하지 않습니다.
        </p>
        <Link
          href="/"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
        >
          대시보드로 돌아가기
        </Link>
      </div>
    </main>
  );
}
