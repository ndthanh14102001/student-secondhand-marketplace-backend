const getUserIdByCtx = (ctx) => {
  return ctx.state.auth.credentials?.id;
};

module.exports = () => ({
  getUserIdByCtx,
});
