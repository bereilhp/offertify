const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const exploradorRoutes = require('./routes/explorador_ofertas');
const portadaRouter = require('./routes/portada');
const loginRouter = require('./routes/login');
const contactoRouter = require('./routes/contacto');
const registroRouter = require('./routes/registro');
const reservasRoutes = require('./routes/misReservas');
const newOfertaRouter = require('./routes/newOferta');
const interfazAdminRouter = require('./routes/interfaz_admin')

const app = express();

// Setup de la sesión
app.use(session({
  secret: "super secret",
  saveUninitialized: false,
  resave: false
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Antes de cargar los manejadores, guardamos las variables
app.use(function(req, res, next) {
  // Hacemos la sesión accesible para las vistas
  res.locals.user = {
    name: "Pablito",
    group: "user"   // User, admin, owner
  }
  // Continuamos gestionando la petición
  next();
});
app.use(function(req,res, next){
  res.locals.user = {
    name: "Pepe",
    group: "admin"
  }
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/explorador_ofertas', exploradorRoutes);
app.use('/portada', portadaRouter);
app.use('/login', loginRouter);
app.use('/registro', registroRouter);
app.use('/contacto', contactoRouter);
app.use('/Reservas', reservasRoutes);
app.use('/NuevaOferta', newOfertaRouter);
app.use('/interfaz_admin', interfazAdminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
