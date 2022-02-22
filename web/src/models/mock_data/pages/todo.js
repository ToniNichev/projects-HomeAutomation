module.exports = [
    {
      id: 'todo',
      url: '/todo',
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
              name: "ToDo"
            }
          ] 
        },                  
      ]
    }
  ]