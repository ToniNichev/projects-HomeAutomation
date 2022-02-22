module.exports = [
  {
    id: 'small-dogs-catalog',
    url: '/small-dogs-catalog',
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
            name: "DogsCatalog"
          },
        ] 
      },                  
    ]
  },  
  {
    id: 'dogs-catalog',
    url: '/dogs-catalog',
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
            name: "DogsCatalogWithRedux"
          },
        ] 
      },                  
    ]
  },
  {
    id: 'big-dogs-catalog',
    url: '/big-dogs-catalog',
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
        span: 8,
        components:[
          {
            name: "DogsCatalogWithRedux"
          },
          {
            name: "GraphqlExample"
          }          
        ] 
      },                  
    ]
  }  
]