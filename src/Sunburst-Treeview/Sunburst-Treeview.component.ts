/**
 * @license
 * Copyright © 2017-2018 OSIsoft, LLC. All rights reserved.
 * Use of this source code is governed by the terms in the accompanying LICENSE file.
 */
import { Component, Input, OnChanges, ViewChild, ElementRef, state, Inject, OnInit, ViewEncapsulation } from '@angular/core';

import Sunburst from 'sunburst-chart';

import { PiWebApiService, DataServer, StreamValues } from '@osisoft/piwebapi';
import { PIWEBAPI_TOKEN } from 'api/tokens';
import { ViewData } from '@angular/core/src/view';
import { test } from 'shelljs';
import { HttpRequest, HttpClient } from '@angular/common/http';

@Component({
  selector: 'Sunburst-Treeview',
  templateUrl: 'Sunburst-Treeview.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['Sunburst-Treeview.component.css']
})

export class SunburstTreeviewComponent implements OnChanges {
  @Input() bkColor: string;
  @Input() pathPrefix: string;
  @Input() data: any;
  @Input() TreePath: string;
  @Input() chartWidth: string;
  @Input() chartHeight: string;
  @Input() refreshRate: string;
  @Input() attributes: string;
  @ViewChild('mychart') mychart: ElementRef;

  values: any[];
  timeoutTimer;
  servicecall;
  _self = this;
  HTTP;
  public sum = 0;
  public childrenLen = 0;
  public asynAttval;

  constructor(@Inject(PIWEBAPI_TOKEN) private piWebApiService: PiWebApiService, private http: HttpClient) {
    this.servicecall = piWebApiService;
    this.HTTP = http;
  }

  ngOnChanges(changes) {
    if (changes.data) {
      let blinkfunction = this.executeblink;
      setTimeout(function () {blinkfunction()}, 1000);
    }
  }

  ngOnInit() {
    this.updatechart();
  }

  ngAfterViewInit() {
    let blinkfunction = this.executeblink;
    let timer = this.StartTimers;
    setTimeout(function () { blinkfunction() }, 1000);
    //    setTimeout(function () { timer() }, 2000);
  }

  //     Customized Functions
  public colorpicker(d, eventnames) {
    const randomcolors = ['#EB984E', '#48C9B0', '#8E44AD', '#82E0AA', '#F1948A', '#C1DC84'];
    let color = randomcolors[Math.floor(Math.random() * randomcolors.length)]
    for (let e = 0; e < eventnames.length; e++) {
      if (d.path === eventnames[e]) {
        color = '#ff0000';
      }
    }
    return color
  }

  public onEvent(event: MouseEvent): void {
    this.ResetTimers();
  }

  public StartTimers() {
    let refreshupdate = this.IdleTimeout;
    let time_insec;
    if (this.refreshRate !== undefined) {
      time_insec = parseInt(this.refreshRate, 16);
    } else {
      time_insec = 60;
    }
    let timeoutNow = time_insec * 1000;
    this.timeoutTimer = setTimeout(function () { refreshupdate() }, timeoutNow);
  }

  public ResetTimers() {

    clearTimeout(this.timeoutTimer);
    this.StartTimers();
  }

  public IdleTimeout() {
    location.reload();
  }

  public GetValues(configUrl, httpR) {
    let c = httpR.get(configUrl).toPromise();
  }

  public updatechart() {
    {
      let _self = this;
      let chartelement = this.mychart;
      let pickcolor = this.colorpicker;
      let cwidth = this.chartWidth;
      let cheight = this.chartHeight;
      let getValues = this.GetValues;
      const treeview = Sunburst();
      let callAPI = this.servicecall;
      let getTooltipValue = this.getTooltipValue;
      let treepath = this.TreePath;
      let httpR = this.HTTP;
      let attributeToDisplay: string[];
      if (this.attributes !== undefined) {
        attributeToDisplay = this.attributes.split(',');
      }
      try {
        let rddata = this.servicecall.element.getByPath$(treepath).toPromise();
        rddata.then(function (t) {
          let treeparts = [];
          treeparts = treepath.split('\\');
          let assetID = callAPI.assetDatabase.getByPath$('\\\\' + treeparts[2] + '\\' + treeparts[3]).toPromise();
          let returndata = callAPI.element.getElements$(t.WebId, { searchFullHierarchy: true }).toPromise();
          assetID.then(function (f) {
           //   console.log(f);
            let eventdata = callAPI.assetDatabase.getEventFrames$(f.WebId).toPromise();
            eventdata.then(function (m) {
              let events = [];
              events = m.Items;
              returndata.then(function (n) {
                //  console.log(n);
                let datapath = [];
                let x = 0;
               
                let attributeData = [];
                for (let k = 0; k < n.Items.length; k++) {
                  if ((n.Items[k].HasChildren) === false) {
                    datapath[x] = n.Items[k].Path;
                    attributeData[x] = callAPI.attribute.getByPath$(datapath[x] + '|' + attributeToDisplay[0]).toPromise();
                    x++;
                  }
                }
                
                Promise.all(attributeData).then(function (z) {
                  
                  let att = [];
                  for (let q = 0; q < z.length; q++) {
                    try {
                      att[q] = callAPI.stream.getValue$(z[q].WebId).toPromise();
                     
                    } catch (exp) { console.log(exp) }
                  }
                  Promise.all(att).then(function (y) {
                    _self.asynAttval = y;
                    let attValue = [];
                    let arrayValue = [];
                    let index = 0;
                   
                    let root;
                    let eventnames = [];
                    for (let i = 0; i < n.Items.length; i++) {
                      try {
                        for (let e = 0; e < events.length; e++) {
                          if (events[e].EndTime === '9999-12-31T23:59:59Z') {
                            for (let r = 0; r < events[e].RefElementWebIds.length; r++) {
                              if (n.Items[i].WebId === events[e].RefElementWebIds[r]) {
                                let treeparts2 = treepath.split('\\');
                                let nk = n.Items[i].Path.indexOf(treeparts2[treeparts2.length - 1]);
                                let path = n.Items[i].Path.slice(nk);
                                eventnames.push(path);
                              }
                            }
                          }
                        }
                      } catch (ex) {
                      }

                      if ((n.Items[i].HasChildren) === false) {
                        attValue[i] = y[index].Value;
                        index++;
                        let path = n.Items[i].Path;
                        let treeparts1 = treepath.split('\\');
                        let n1 = path.indexOf(treeparts1[treeparts1.length - 1]);
                        let path1 = path.slice(n1);
                         let parts = path1.split('\\');
                        let sunburstpath = parts[0];

                        if (root == null) {
                          root = { 'name': parts[0], 'path': sunburstpath, 'children': [] };
                        }
                        let currentNode = root;

                        for (let j = 1; j < parts.length; j++) {
                          sunburstpath = sunburstpath + '\\' + parts[j];
                          let children = currentNode['children'];
                          let nodeName = parts[j];
                          let childNode;
                          if ((j + 1) < parts.length) {
                            let foundChild = false;
                            for (let k = 0; k < children.length; k++) {
                              if (children[k]['name'] === nodeName) {
                                childNode = children[k];
                                foundChild = true;
                                break;
                              }
                            }
                            if (!foundChild) {
                              childNode = { 'name': nodeName, 'path': sunburstpath, 'children': [] };
                              children.push(childNode);
                            }
                            currentNode = childNode;
                          } else {
                            if (isNaN(attValue[i])) {
                              childNode = { 'name': nodeName, 'path': sunburstpath, 'value': 1 };
                            } else {
                              childNode = { 'name': nodeName, 'path': sunburstpath, 'value': Number(attValue[i]) };

                            }
                            children.push(childNode);
                          }
                        }
                      }
                    }
                    // console.log(root);
                    if (isNaN(_self.asynAttval[0].Value)) {
                      treeview.data(root)(chartelement.nativeElement).color((d, parent) => pickcolor(d, eventnames))
                        .tooltipContent((d, node) => attributeToDisplay[0]);
                    } else {
                      treeview.data(root)(chartelement.nativeElement).color((d, parent) => pickcolor(d, eventnames))
                        .tooltipContent((d, node) => getTooltipValue(attributeToDisplay[0], node, _self));
                    }
                    treeview.width(cwidth);
                    treeview.height(cheight);
                  }).catch(function (err) {});;
                }).catch(function (err) {});
              }).catch(function (err) {});;
            }).catch(function (err) {});;
          }).catch(function (err) {});;
        }).catch(function (err) {});;
      } catch (ex) {
       
      }
    }
  }

  public getTooltipValue(attName, node, _self) {
    
    let returnVal = '';
    if (node.data.children !== undefined) {

      let parentData = node.data;
      let childData = [];
      _self.sum = 0;
      _self.childrenLen = 0;
      childData = _self.getchildData(parentData.children, _self);
      //  console.log('function', childData , node)
      returnVal = attName + ' average : ' + (Number(childData[0].sum) / Number(childData[0].childlen));
    } else {
      returnVal = attName + ': ' + node.value;
    }
    return returnVal;
  }
  public getchildData(childrenNode, _self) {

    for (let t = 0; t < childrenNode.length; t++) {

      if (childrenNode[t].children !== undefined) {
        //  console.log('if', _self.childrenLen);
        _self.getchildData(childrenNode[t].children, _self)
      } else {

        _self.sum += childrenNode[t].value;
        _self.childrenLen++
       //   console.log('else', _self.sum, childrenNode[t].value);
      }
    }
    let result = [];
    result.push({ 'sum': _self.sum, 'childlen': _self.childrenLen });
    //   console.log('result',result);
    return result;
  }
  public executeblink() {
    try {
      let selects = document.getElementsByTagName('path');
      for (let i = 0; i < selects.length; i++) {
        for (let j = 0; j < selects[i].attributes.length; j++) {
          if (selects[i].attributes[j].name === 'style') {
            if (selects[i].attributes[j].value === 'fill: rgb(255, 0, 0);') {
              selects[i].classList.add('flash');
               ///  console.log(selects[i])
            }
          }
        }
      }
    } catch { }
  }
}


