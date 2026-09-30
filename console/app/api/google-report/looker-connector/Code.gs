/**
 * Modonty — Google Search report connector for Looker Studio (Apps Script, account modonty1@gmail.com).
 *
 * One report serves every client. The report link carries the client's signed key
 * (?params={"ds0.key":"<clientId>.<signature>"}); this connector forwards it to
 * console.modonty.com/api/google-report, which answers with that client's pages only.
 * A missing or altered key gets 401 and the report shows an error — never another client's rows.
 *
 * Source of truth for the deployed script: edit here, then paste into the Apps Script project.
 */
var cc = DataStudioApp.createCommunityConnector();
var ENDPOINT = 'https://console.modonty.com/api/google-report';

function getAuthType() {
  return cc.newAuthTypeResponse().setAuthType(cc.AuthType.NONE).build();
}

function isAdminUser() {
  return false;
}

function getConfig() {
  var config = cc.getConfig();
  config
    .newTextInput()
    .setId('key')
    .setName('مفتاح العميل')
    .setHelpText('يُمرَّر من رابط التقرير في لوحة العميل.')
    .setAllowOverride(true);
  config.setDateRangeRequired(true);
  return config.build();
}

function getFields() {
  var fields = cc.getFields();
  var types = cc.FieldType;
  var agg = cc.AggregationType;
  fields.newDimension().setId('date').setName('التاريخ').setType(types.YEAR_MONTH_DAY);
  fields.newDimension().setId('page').setName('الصفحة').setType(types.TEXT);
  fields.newDimension().setId('url').setName('الرابط').setType(types.URL);
  fields.newDimension().setId('query').setName('عبارة البحث').setType(types.TEXT);
  fields.newMetric().setId('impressions').setName('مرّات الظهور').setType(types.NUMBER).setAggregation(agg.SUM);
  fields.newMetric().setId('clicks').setName('النقرات').setType(types.NUMBER).setAggregation(agg.SUM);
  fields.newMetric().setId('positionWeight').setName('وزن الترتيب').setType(types.NUMBER).setAggregation(agg.SUM).setIsHidden(true);
  fields
    .newMetric()
    .setId('ctr')
    .setName('نسبة النقر')
    .setType(types.PERCENT)
    .setFormula('SUM($clicks) / SUM($impressions)')
    .setAggregation(agg.AUTO);
  fields
    .newMetric()
    .setId('position')
    .setName('متوسّط الترتيب')
    .setType(types.NUMBER)
    .setFormula('SUM($positionWeight) / SUM($impressions)')
    .setAggregation(agg.AUTO);
  return fields;
}

function getSchema() {
  return { schema: getFields().build() };
}

/** No key, or a key our server rejects: the report was opened without the client's own link. */
function invalidLink() {
  cc.newUserError().setText('رابط التقرير غير صالح — افتحه من زرّ جوجل في لوحتك على مدونتي.').throwException();
}

function getData(request) {
  var ids = request.fields.map(function (f) { return f.name; });
  var requested = getFields().forIds(ids);
  var dims = ['date', 'page', 'query'].filter(function (d) {
    return ids.indexOf(d) !== -1 || (d === 'page' && ids.indexOf('url') !== -1);
  });

  var key = (request.configParams && request.configParams.key) || '';
  if (!key) invalidLink();
  var url = ENDPOINT +
    '?key=' + encodeURIComponent(key) +
    '&start=' + request.dateRange.startDate +
    '&end=' + request.dateRange.endDate +
    '&dims=' + dims.join(',');
  var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  var code = resp.getResponseCode();
  if (code === 401) invalidLink();
  if (code !== 200) {
    cc.newUserError().setText('تعذّر جلب الأرقام من جوجل الآن. حاول بعد قليل.').setDebugText('HTTP ' + code).throwException();
  }

  var data = JSON.parse(resp.getContentText());
  var rows = data.rows.map(function (r) {
    return {
      values: ids.map(function (id) {
        if (id === 'date') return r.date.replace(/-/g, '');
        return r[id] === undefined ? '' : r[id];
      }),
    };
  });
  return { schema: requested.build(), rows: rows };
}
