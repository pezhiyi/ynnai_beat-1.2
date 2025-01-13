import Layout from '../components/Layout/Layout';

function Error({ statusCode }) {
  return (
    <Layout>
      <div className="error-container">
        <h1>
          {statusCode
            ? `${statusCode} - 服务器错误`
            : '应用程序错误'}
        </h1>
        <p>抱歉，出现了一些问题。我们正在努力修复。</p>
      </div>
    </Layout>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error; 