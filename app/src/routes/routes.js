// ------------------------------------------------------------------------------
//  ROUTING
// ------------------------------------------------------------------------------

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//  LOGIN
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function getLogin(req, res) {
  if (req.isAuthenticated()) {
    const user = req.user;
    res.redirect('/')
  }
  else {
    
    res.render('pages/login');
  }
}

function getSignup(req, res) {
  res.render('pages/signup');

}


function postLogin(req, res) {
  res.redirect('/')
}

function postSignup(req, res) {
  res.redirect('/')
}

function getFaillogin(req, res) {
  const title = 'USER ERROR LOGIN';
  res.render('pages/error', { titulo: title });
}

function getFailsignup(req, res) {
  const title = 'USER ERROR SIGNUP';
  res.render('pages/error', { titulo: title });
}

function getLogout(req, res) {
  const user = req.user;
  req.logout();
  res.render('pages/bye', { user: user.username });
}

function failRoute(req, res) {
  const title = 'ROUTING ERROR';
  res.status(404).render('pages/error', { titulo: title });
}

module.exports = {
  getLogin,
  postLogin,
  getFaillogin,
  getLogout,
  failRoute,
  getSignup,
  postSignup,
  getFailsignup
}
