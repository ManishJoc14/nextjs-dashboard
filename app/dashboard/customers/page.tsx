import { Metadata } from 'next';
import { fetchFilteredCustomers } from '@/app/lib/data';
import Table from '@/app/ui/customers/table';
import { Suspense } from 'react';
import Pagination from '@/app/ui/invoices/pagination';

export const metadata: Metadata = {
  title: 'Customers',
};
export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const { totalPages } = await fetchFilteredCustomers(query, currentPage);
  return (
    <>
      <Suspense fallback="loading...">
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </>
  );
}
