# fontoxml-standard-cms-contracts-from-disk

This is a tiny Express server that serves the Standard CMS contracts as they are expected by FontoXML Editor 7+, based
on a working directory on your disk.

This server aims to take as little configuration as possible, as well as making as little asumptions about the XSD
schema used as it can. Further more, the produced content is made as portable as possible; currently fully relative
file references are not supported by the Fonto editor, therefore also not by fontoxml-standard-cms-contracts-from-disk.
