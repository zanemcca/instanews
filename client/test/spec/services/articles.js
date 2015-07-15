      /*
      it('should call Articles.add once', function() {
        arts = [
          {
            id: '1',
            subarticles: []
          }
        ];

        scope.onRefresh();

        expect(articles.add.calledOnce).to.be.true;
      });

      it('should call Articles.get once', function() {
        arts = [
          {
            id: '1',
            subarticles: []
          }
        ];

        scope.onRefresh();

        expect(articles.get.calledOnce).to.be.true;
      });
     */

      /*
      it('should get 5 articles', function() {
        arts = [
          {
            id: '1',
            subarticles: []
          },
          {
            id: '2',
            subarticles: []
          },
          {
            id: '3',
            subarticles: []
          },
          {
            id: '4',
            subarticles: []
          },
          {
            id: '5',
            subarticles: []
          }
        ];

        scope.onRefresh();

        expect(scope.articles.length).to.equal(5);
      }); 
     */

      /*
      it('should set the topSub of the article', function() {
        arts = [
          {
            id: '1',
            subarticles: [
              {
                id: 's1'
              },
              {
                id: 's2'
              }
            ]
          }
        ];

        scope.onRefresh();

        expect(scope.articles.length).to.equal(1);
        expect(scope.articles[0].topSub).to.exist;
        expect(scope.articles[0].topSub.id).to.equal('s1');
      });
     */
      /*
      it('should remove the duplicate article', function() {

        sinon.stub(articles, 'getOne', function(id) {
          return true;
        });

        arts = [
          {
            id: '1',
            subarticles: []
          }
        ];

        scope.loadMore();

        expect(articles.getOne.callCount).to.equal(1);
        expect(scope.articles.length).to.equal(0);
      }); 

      it('should append the arts to scope.articles', function() {

        scope.articles = [
          {
            id: '1',
            subarticles: []
          }
        ];

        arts = [
          {
            id: '2',
            subarticles: []
          }
        ];

        scope.loadMore();

        expect(scope.articles.length).to.equal(2);
        expect(scope.articles[1]).to.equal(arts[0]);
      }); 
     */

