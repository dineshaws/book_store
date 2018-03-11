import * as mocha from 'mocha';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import faker = require('faker');
import User from '../src/models/UserModel';

import app from '../src/App';
var should = chai.should();
chai.use(chaiHttp);
const expect = chai.expect;

describe('Users', function () {
  before(function (done) {
    User.remove({}, done);
  });
  describe('Signup pass', function () {
    it('should create a new valid user', function (done) {
      chai.request(app)
      .post('/api/v1/users/signup')
      .send({
        username: 'Dineshaws',
        email: 'dinesh@xyz.com',
        password: 'password'
      })
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        done();
      });
    })
  });
  describe('Signin pass', function () {
    it('should signin a valid user', function (done) {
      chai.request(app)
      .post('/api/v1/users/signin')
      .send({
        email: 'dinesh@xyz.com',
        password: 'password'
      })
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        done();
      });
    })
  });
  describe('Signup fail', function () {
    it('should fail because of missing username', function (done) {
      chai.request(app)
      .post('/api/v1/users/signup')
      .send({
        email: faker.internet.email(),
        password: faker.internet.password()
      })
      .end(function(err, res){
        res.should.have.status(409)
        res.should.be.json;
        done();
      });
    })
  });
  describe('Signup fail', function () {
    it('should fail because of missing password', function (done) {
      chai.request(app)
      .post('/api/v1/users/signup')
      .send({
        username: faker.internet.userName(),
        email: faker.internet.email()
      })
      .end(function(err, res){
        res.should.have.status(409);
        res.should.be.json;
        done();
      });
    })
  });
  describe('Signup fail', function () {
    it('should fail because of missing email', function (done) {
      chai.request(app)
      .post('/api/v1/users/signup')
      .send({
        username: faker.internet.userName(),
        password: faker.internet.password()
      })
      .end(function(err, res){
        res.should.have.status(409);
        res.should.be.json;
        done();
      });
    })
  });
  describe('Signup fail', function () {
    it('should fail because of existing user', function (done) {
      chai.request(app)
      .post('/api/v1/users/signup')
      .send({username: 'Dineshaws',
        email: 'dinesh@xyz.com',
        password: 'password'
      })
      .end(function(err, res){
        res.should.have.status(409);
        res.should.be.json;
        done();
      });
    })
  });
  describe('Signin fail', function () {
    it('should reject user because of wrong password', function (done) {
      chai.request(app)
      .post('/api/v1/users/signin')
      .send({
        email: 'dinesh@xyz.com',
        password: faker.internet.password()
      })
      .end(function(err, res){
        res.should.have.status(403);
        res.should.be.json;
        done();
      });
    })
  });
  describe('Signin fail', function () {
    it('should reject user because of wrong email', function (done) {
      chai.request(app)
      .post('/api/v1/users/signin')
      .send({
        email: faker.internet.email(),
        password: 'password'
      })
      .end(function(err, res){
        res.should.have.status(403);
        res.should.be.json;
        done();
      });
    })
  });


})