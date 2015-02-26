

# com.marryy

User Role
1. end user
http://segmentfault.com/q/1010000001663480

Jquery plugins:
https://github.com/kayahr/jquery-fullscreen-plugin

## Usage



## Developing



### Tools

Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   

Nodeclipse is free open-source project that grows with your contributions.


#mongo full-text search
db.galleries.ensureIndex(
                           { "$**": "text" },
                           { name: "TextIndex" }
                         )