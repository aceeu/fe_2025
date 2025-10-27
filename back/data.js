let MongoClient = require('mongodb').MongoClient;
let ObjectID = require('mongodb').ObjectID;
let moment = require('moment');
let config = require('./config');
const { ObjectId } = require('mongodb');
const detectValidUser = require('./helpers').detectValidUser;


function dataHandler(action) {
  return async function(req, res, next) {
    try {
      if (!req.session.name)
        throw 'invalid session';
      const client = await MongoClient.connect(config.database_url);
      if (!detectValidUser(client, req.session))
        throw 'invalid user';
      const collection = client.db(config.db_name).collection('data');
      await action(collection, req, res);
    } catch(e) {
      console.log(`exception: ${e}`);
      res.json({res: false, text: e ? e.toString(): 'unknown'});
    } finally {
      res.end();
    }
  } // end function
}



async function delRow(collection, req, res) {
  const row = req.body;
  if (!row._id)
    throw 'invalid id';
  const ires = await collection.deleteOne({_id: ObjectID(row._id)});
  if (ires.ok)
    res.json({res: true, text: `${row._id} deleted`});
  else
    throw ires.lastErrorObject;
}

const requiredParamsForAdd = ['_id', 'creator', 'buyer', 'category', 'buyDate', 'product', 'sum', 'whom', 'note'];

const requiredParamsForEdit = ['_id', 'editor', 'buyer', 'category', 'buyDate', 'product', 'sum', 'whom', 'note'];


function checkDataFor(data, requiredParams) {
    const keys = Object.keys(data);
    // if (requiredParams.length != keys.length)
    //     return false;
    let res = [];
    keys.forEach((k, i) => {
         res[i] = requiredParams.findIndex(p => p == k);
    })
    return res.findIndex(v => v === -1) == -1;
}

async function editRow(collection, req, res) {
  let row = req.body;
  if (!checkDataFor(row, requiredParamsForEdit))
    throw 'invalid check data';
  row = {...row, buyDate: new Date(row.buyDate)}; // convert to date of buydate value
  const {_id, ...rowni} = row;
  const thisdate = moment().toDate();
  const values = {...rowni, editor: req.session.name, edited: thisdate}
  console.log({_id}, {values})
  const {acknowledged, insertedId} = await collection.updateOne({_id: new ObjectId(_id)}, {$set:values});
  if (acknowledged)
      res.json({res: true, text: 'item edited' + insertedId});
  else
      throw 'cannot edit a record';
}

async function addRow(collection, req, res) {
  let {_id, ...row} = req.body;
  if (!checkDataFor(row, requiredParamsForAdd))
    throw 'invalid check data';
  row = {...row, buyDate: new Date(row.buyDate)}; // convert to date of buydate value
  const thisdate = moment().toDate();
  row = { ...row, created: thisdate, creator: req.session.name,  sum: +row.sum };
  const {acknowledged, insertedId}  = await collection.insertOne(row);
  if (acknowledged) {
      res.json({res: true, text: 'item added:' + insertedId, row},);
  } else
      throw 'cannot insert data to db';
}

const validFilterColumns = ['buyer', 'category', 'product'];
function checkFilter(filter) {
  let columns = Object.keys(filter);
  return columns.reduce((res, c) => {
    if (filter[c].length && filter[c] != '*' && validFilterColumns.findIndex(v => c == v) != -1) {
      res[c] = {$eq: filter[c]};
    }
    return res;
  }, {});
}

function makeSummary(items) {
  return items.reduce((res, itm) => {
    if (res[itm.category]) {
      res[itm.category] += +itm.sum;
    } else
      res[itm.category] = +itm.sum;
    return res;
  }, {})
}

function fetchDataHandler() {
    return async function(req, res, next) {
        try{
          if (!req.session.name)
            throw 'invalid session';
          const fromDate = moment(req.body.fromDate);
          const toDate =moment(req.body.toDate) || moment().toDate(); // toDate < fromDate

          const {filter} = req.body;
          const client = await MongoClient.connect(config.database_url);
          if (await detectValidUser(client, req.session)) {
              const collection = client.db(config.db_name).collection('data');
              let findExpr = {buyDate: {$gte: fromDate.toDate(), $lt: toDate.toDate()}};
              // if (filter && filter.column && filter.column == 'buyer' && filter.text.length)
              //   findExpr = {...findExpr, buyer: {$eq: filter.text}};
              let checkedFilter = checkFilter(filter);
              findExpr = {...findExpr, ...checkedFilter};
              const findRes = await collection.find(findExpr);
              let items = await findRes.toArray();
              res.json({res: items, summary: makeSummary(items)});
          } else {
              res.json({res: false, text: 'invalid user'});
          }
        } catch(e) {
          res.json({res: false, text: e.toString()})
        } finally {
          res.end();
        }
    }
}

function fetchCategories() {
  return async function (req, res, next) {
    try{
      const client = await MongoClient.connect(config.database_url);
      if (await detectValidUser(client, req.session)) {
          const collection = client.db(config.db_name).collection('categories');
          const findRes = await collection.find();
          const items = await findRes.toArray()
          res.json({res: items.filter(v => !v.archived || v.archived !== 1)});
        } else {
          throw 'invalid user';
        }
    } catch (e) {
      res.json({res: false, text: e.toString()})
    } finally {
      res.end();
    }
  }
}

const handlers=[addRow, editRow, delRow];

exports.dataHandler = dataHandler;
exports.fetchDataHandler = fetchDataHandler;
exports.action_handlers = handlers;
exports.fetchCategories = fetchCategories;
