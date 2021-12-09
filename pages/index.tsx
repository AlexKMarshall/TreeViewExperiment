import { NewTreeWithCount, TreeWithCount } from "../types";

import Head from "next/head";
import { TreeTable } from "../components/tree-view";
import { useQuery } from "react-query";

function Home() {
  const query = useQuery("tags", async () => {
    try {
      const res = await fetch("/api");
      const data = (await res.json()) as NewTreeWithCount;
      return data;
    } catch (error) {
      throw error;
    }
  });

  return (
    <>
      <Head>
        <title>Tree View</title>
        <meta name="description" content="Tree view experiment" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Tree View</h1>

        {query.isLoading ? <div>Loading...</div> : null}
        {query.isError ? (
          <pre>Error: {JSON.stringify(query.error, null, 2)}</pre>
        ) : null}
        {query.isSuccess ? <TreeTable data={query.data} /> : null}
      </main>
    </>
  );
}

export default Home;
