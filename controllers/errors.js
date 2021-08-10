exports.error404 = (req, res, next) => {
    res.status(404).render('404', {
        pageTitle: '404 error',
        path: '404',
        isAuthenticated: req.session.isLoggedIn
    });
}

exports.error500 = (req, res, next) => {
    res.status(500).render('500', {
        pageTitle: '500 error',
        path: '500',
        isAuthenticated: req.session.isLoggedIn
    });
}