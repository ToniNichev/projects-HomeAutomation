module.exports = [
    {
      id: 'greetings',
      url: '/greetings',
      layout: [ 
        {
          span: 12,
          components: [
            {
              name: "Header"
            }
          ]
        },
        {
          span: 12,
          components:[
            {
              name: "Greetings"
            }
          ] 
        }                        
      ]
    }
  ]