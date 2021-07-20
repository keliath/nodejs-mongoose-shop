exports.error404 = (req, res, next) => {
    res.status(404).render('404', {
        pageTitle: '404 error',
        path: '404'
    });
}