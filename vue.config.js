module.exports = {
  chainWebpack: config => {
    config.plugin("html").tap(args => {
      args[0].title = "Saaransh Menon";
      return args;
    });
  },
  publicPath: process.env.NODE_ENV === "production" ? "/hello-world/" : "/"
};
