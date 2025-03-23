const { google } = require('googleapis');
require("dotenv").config();

const SERVICE_ACCOUNT_CREDENTIALS = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN
};

const auth = new google.auth.GoogleAuth({
  credentials: SERVICE_ACCOUNT_CREDENTIALS,
  scopes: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets'
  ]
});

const drive = google.drive({ version: 'v3', auth });
const sheets = google.sheets({ version: 'v4', auth });

class GoogleController {
  /**
   * Listar arquivos dentro de uma pasta específica do Google Drive
   */
  async listFiles(req, res) {
    try {
      const folderId = req.params.folderId;
      const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id, name)'
      });
      res.json(response.data.files);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar arquivos', details: error.message });
    }
  }

  /**
   * Listar todas as pastas do Google Drive
   */
  async listFolders(req, res) {
    try {
      const response = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields: 'files(id, name)'
      });
      res.json(response.data.files);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar pastas', details: error.message });
    }
  }

  /**
   * Criar uma nova planilha seguindo um modelo pré-definido
   */
  async createSpreadsheet(req, res) {
    try {
      const response = await sheets.spreadsheets.create({
        resource: {
          properties: {
            title: req.body.title || 'Nova Planilha'
          },
          sheets: [
            {
              properties: { title: 'Dados' },
              data: [{
                startRow: 0,
                startColumn: 0,
                rowData: [{ values: [
                  { userEnteredValue: { stringValue: 'Nome' } },
                  { userEnteredValue: { stringValue: 'Email' } },
                  { userEnteredValue: { stringValue: 'Telefone' } }
                ] }]
              }]
            }
          ]
        }
      });
      res.json({ message: 'Planilha criada com sucesso', spreadsheetId: response.data.spreadsheetId });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar planilha', details: error.message });
    }
  }

  /**
   * Buscar dados de uma planilha específica
   */
  async getSpreadsheetData(req, res) {
    try {
      const { spreadsheetId, range } = req.body.data;
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range
      });
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar dados da planilha', details: error.message });
    }
  }

  async copySpreadsheet(req, res) {
    try {
      const { templateId, newTitle, folderId } = req.body.data; // folderId é opcional
      const resource = { 
        name: newTitle
      };
      // Se o folderId for informado, adiciona a propriedade 'parents'
      if (folderId) {
        resource.parents = [folderId];
      }
      const response = await drive.files.copy({
        fileId: templateId,
        resource
      });
      res.json({ message: 'Planilha criada com sucesso', spreadsheetId: response.data.id });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao copiar planilha', details: error.message });
    }
  }

  async getFullSpreadsheetData(req, res) {
    try {
      const { spreadsheetId, includeData } = req.query.data; // Ex: includeData=true
      const response = await sheets.spreadsheets.get({
        spreadsheetId,
        includeGridData: includeData === 'true'
      });
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar dados completos da planilha', details: error.message });
    }
  }
 
}

module.exports = new GoogleController();