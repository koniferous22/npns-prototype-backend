const isDev = process.env.NODE_ENV === 'dev';

export const configuration = {
  appPort: 3000,
  dbUrl: 'mongodb://localhost:27017/npns_db',
  // dbUrl: isDev
  //   ? 'mongodb://localhost:27017/npns_db'
  //   : 'mongodb://heroku_rmzmf414:r0i9je0ou0mafovfi4mgvsp9hd@ds237832.mlab.com:37832/heroku_rmzmf414',
  external: {
    nodemailer: {
      host: 'smtp.ethereal.email',
      port: 587,
      user: 'arlo.romaguera@ethereal.email',
      password: 'G2zFYVjjpAXwq1vyBm'
    }
  },
  webAddress: 'http://localhost:3001/',
  jwtKey: 'TopSecretKey123',
  // TODO refactor epoch config into sth more normal
  testEpoch: {
    begin: {
      year: 2019,
      month: 12,
      day: 1
    },
    end: {
      year: 2021,
      month: 1,
      day: 1
    },

  }
} as const;
